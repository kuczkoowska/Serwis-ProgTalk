<template>
  <div
    class="surface-card p-3 border-round shadow-1 border-1 surface-border transition-colors transition-duration-200"
    :class="{ 'opacity-60 bg-gray-50': post.isDeleted }"
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
          <span class="font-bold text-900">
            {{ post.author?.username || "Użytkownik usunięty" }}
            <Tag
              v-if="post.author?.role === 'admin'"
              value="Admin"
              severity="danger"
              class="ml-2 text-xs py-0 px-2"
            />
          </span>
          <span class="text-sm text-500">
            {{ formatDate(post.createdAt) }}
          </span>
        </div>
      </div>

      <div v-if="!post.isDeleted && (canDelete || isModerator)">
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          @click="$emit('delete', post._id)"
        />
      </div>
    </div>

    <div
      v-if="post.replyTo && !post.isDeleted"
      class="surface-ground p-2 border-round mb-3 border-left-3 border-primary cursor-pointer hover:surface-hover"
      @click="scrollToPost(post.replyTo._id)"
    >
      <div class="text-xs text-500 mb-1 flex align-items-center gap-1">
        <i class="pi pi-reply"></i> Odpowiedź do:
        <strong>{{ post.replyTo.author?.username || "Nieznany" }}</strong>
      </div>
      <div
        class="text-sm text-700 white-space-nowrap overflow-hidden text-overflow-ellipsis italic"
      >
        "{{ post.replyTo.content }}"
      </div>
    </div>

    <div class="text-900 line-height-3 mb-3" style="word-break: break-word">
      <div
        v-if="post.isDeleted"
        class="font-italic text-500 flex align-items-center gap-2"
      >
        <i class="pi pi-trash"></i> Post został usunięty.
      </div>
      <div v-else>{{ post.content }}</div>
    </div>

    <div
      v-if="!post.isDeleted"
      class="flex align-items-center gap-3 pt-2 border-top-1 surface-border"
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
</script>
