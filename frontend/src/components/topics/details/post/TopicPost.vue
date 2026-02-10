<template>
  <div
    class="surface-card p-3 border-round shadow-1 border-1 surface-border transition-colors transition-duration-200"
    :class="{
      'deleted-post-admin': post.isDeleted && isAdmin,
      'deleted-post-user': post.isDeleted && !isAdmin,
    }"
    :id="`post-${post._id}`"
  >
    <div class="flex justify-content-between align-items-start mb-3">
      <div class="flex align-items-center gap-3">
        <Avatar
          :label="post.author?.username?.charAt(0).toUpperCase() || '?'"
          shape="circle"
          size="large"
          class="bg-primary-50 text-primary font-bold"
        />
        <div class="flex flex-column">
          <div class="flex align-items-center gap-2">
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

          <span class="text-sm text-500">
            {{ formatDate(post.createdAt) }}
          </span>
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

    <div v-if="!post.isDeleted || isAdmin" class="post-content-wrapper">
      <div
        v-if="post.replyTo"
        class="reply-reference cursor-pointer hover:surface-hover"
        :class="{ 'opacity-50': post.replyTo.isDeleted }"
        @click="!post.replyTo.isDeleted && scrollToPost(post.replyTo._id)"
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
      class="text-500 font-italic text-sm py-3 flex align-items-center justify-content-center bg-gray-50 border-round"
    >
      <i class="pi pi-trash mr-2"></i> Ta wiadomość została usunięta przez
      moderatora lub autora.
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
import { computed } from "vue";

const props = defineProps({
  post: { type: Object, required: true },
  currentUserId: String,
  isModerator: Boolean,
  isAdmin: Boolean,
});

defineEmits(["like", "reply", "delete"]);

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

const canDelete = computed(() => {
  return props.post.author?._id === props.currentUserId;
});

const scrollToPost = (id) => {
  const el = document.getElementById(`post-${id}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
};

const parsedContent = computed(() => {
  const text = props.post.content || "";
  const regex = /```(\w*)\n?([\s\S]*?)```/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: "code",
      lang: match[1] || "plaintext",
      content: match[2].trim(),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts;
});
</script>

<style scoped>
.deleted-post-admin {
  background-color: #fff5f5 !important;
  border-color: #fca5a5 !important;
  opacity: 0.9;
}

.deleted-post-user {
  opacity: 0.7;
  border-style: dashed;
}

.reply-reference {
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid var(--primary-color);
  border-radius: 6px;
  margin-bottom: 0.75rem;
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
