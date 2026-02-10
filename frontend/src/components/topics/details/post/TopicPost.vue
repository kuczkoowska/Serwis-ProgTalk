<template>
  <div
    class="surface-card p-3 border-round shadow-1 border-1 surface-border transition-colors transition-duration-200"
    :class="{
      'opacity-60 bg-gray-50': post.isDeleted,
      'border-blue-200 bg-blue-50': isMyPost && !post.isDeleted,
      'highlight-flash': isHighlighted,
    }"
    :id="`post-${post._id}`"
  >
    <div class="flex justify-content-between align-items-start mb-2">
      <div class="flex align-items-center gap-3">
        <Avatar
          :label="post.author?.username?.charAt(0).toUpperCase() || '?'"
          shape="circle"
          size="large"
          class="bg-primary-50 text-primary font-bold"
        />
        <div class="flex flex-column gap-1">
          <div class="flex align-items-center gap-2 flex-wrap">
            <span class="font-bold text-900">
              {{ post.author?.username || "Użytkownik" }}
            </span>

            <Tag
              v-if="post.author?.role === 'admin'"
              value="Admin"
              severity="danger"
              class="text-xs py-0 px-2"
            />

            <Tag
              v-if="post.isDeleted"
              value="USUNIĘTY"
              severity="danger"
              class="text-xs py-0 px-2"
            />
          </div>

          <div class="flex align-items-center gap-2">
            <span class="text-sm text-500">
              {{ formatDate(post.createdAt) }}
            </span>

            <div
              v-if="post.tags && post.tags.length > 0"
              class="flex gap-1 ml-2"
            >
              <span
                v-for="tag in post.tags"
                :key="tag._id"
                class="text-xs px-2 py-0 border-round text-white font-medium"
                :style="{ backgroundColor: tag.color || '#64748b' }"
              >
                #{{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!post.isDeleted && (canDelete || isAdmin || isModerator)">
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          v-tooltip.top="'Usuń post'"
          @click="$emit('delete', post._id)"
        />
      </div>
    </div>

    <div v-if="!post.isDeleted || isAdmin" class="post-content-wrapper mt-2">
      <div
        v-if="post.isDeleted && isAdmin"
        class="text-red-500 text-sm font-bold mb-2"
      >
        <i class="pi pi-eye-slash mr-1"></i> Treść widoczna tylko dla
        moderatorów:
      </div>

      <div
        v-if="post.replyTo"
        class="reply-reference cursor-pointer transition-colors transition-duration-200"
        :class="{ 'opacity-50': post.replyTo.isDeleted }"
        @click="!post.replyTo.isDeleted && scrollToPost(post.replyTo._id)"
        v-tooltip.top="'Kliknij, aby zobaczyć oryginał'"
      >
        <div class="text-xs text-500 mb-1 flex align-items-center gap-1">
          <i class="pi pi-reply"></i> Odpowiedź do:
          <strong>{{ post.replyTo.author?.username || "Nieznany" }}</strong>
        </div>
        <div
          class="text-sm text-700 white-space-nowrap overflow-hidden text-overflow-ellipsis italic"
        >
          <span v-if="post.replyTo.isDeleted">[Post usunięty]</span>
          <span v-else>"{{ post.replyTo.content }}"</span>
        </div>
      </div>

      <div class="text-900 line-height-3" style="word-break: break-word">
        <template v-for="(part, index) in parsedContent" :key="index">
          <div v-if="part.type === 'code'" class="my-2">
            <highlightjs autodetect :code="part.content" />
          </div>
          <span v-else class="white-space-pre-wrap">{{ part.content }}</span>
        </template>
      </div>
    </div>

    <div
      v-else
      class="text-500 font-italic text-sm py-3 flex align-items-center justify-content-center bg-gray-50 border-round mt-2"
    >
      <i class="pi pi-trash mr-2"></i> Ta wiadomość została usunięta.
    </div>

    <div
      v-if="!post.isDeleted"
      class="flex align-items-center gap-3 pt-2 border-top-1 surface-border mt-3"
    >
      <Button
        :icon="isLiked ? 'pi pi-heart-fill' : 'pi pi-heart'"
        :label="String(post.likes?.length || post.likesCount || 0)"
        :severity="isLiked ? 'danger' : 'secondary'"
        text
        size="small"
        @click="$emit('like', post._id)"
      />

      <Button
        icon="pi pi-reply"
        label="Odpowiedz"
        severity="secondary"
        text
        size="small"
        @click="$emit('reply', post)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useToastHelper } from "../../../../composables/useToastHelper";
import { usePostsStore } from "../../../../stores/posts";

const props = defineProps({
  post: { type: Object, required: true },
  currentUserId: String,
  isModerator: Boolean,
  isAdmin: Boolean,
});

defineEmits(["like", "reply", "delete"]);

const isHighlighted = ref(false);
const postsStore = usePostsStore();
const { showInfo, showError } = useToastHelper();

const formatDate = (date) =>
  new Date(date).toLocaleString("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const isLiked = computed(() => {
  if (Array.isArray(props.post.likes)) {
    return props.post.likes.includes(props.currentUserId);
  }
  return false;
});

const isMyPost = computed(() => props.post.author?._id === props.currentUserId);
const canDelete = computed(
  () => props.post.author?._id === props.currentUserId,
);

const scrollToPost = async (id) => {
  let el = document.getElementById(`post-${id}`);

  if (el) {
    animateScroll(el);
    return;
  }

  showInfo("Szukam posta na innych stronach...");

  const success = await postsStore.loadPageWithPost(id);

  if (success) {
    await nextTick();

    el = document.getElementById(`post-${id}`);
    if (el) {
      animateScroll(el);
    } else {
      showError("Nie udało się znaleźć posta (może został usunięty?).");
    }
  }
};

const animateScroll = (el) => {
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("highlight-flash");
  setTimeout(() => {
    el.classList.remove("highlight-flash");
  }, 2000);
};

const parsedContent = computed(() => {
  const text = props.post.content || "";
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "code",
      lang: match[1] || "plaintext",
      content: match[2].trim(),
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }
  return parts;
});
</script>

<style scoped>
.reply-reference {
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid var(--primary-color);
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.reply-reference:hover {
  background-color: #e0f2fe;
  border-left-color: #2563eb;
}

@keyframes flash {
  0% {
    background-color: rgba(254, 240, 138, 0.6);
    transform: scale(1.02);
  }
  50% {
    background-color: rgba(254, 240, 138, 0.3);
    transform: scale(1.01);
  }
  100% {
    background-color: transparent;
    transform: scale(1);
  }
}

.highlight-flash {
  animation: flash 2s ease-out;
  border: 1px solid #facc15 !important;
}

:deep(pre) {
  margin: 0;
  border-radius: 6px;
}
:deep(code) {
  font-family: "Fira Code", monospace;
  font-size: 0.9rem;
}
</style>
