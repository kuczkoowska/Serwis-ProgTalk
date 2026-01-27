<template>
  <div
    class="custom-card post-card mb-3"
    :data-post-id="post._id"
    :class="{ 'deleted-post': post.isDeleted }"
  >
    <div v-if="post.isDeleted" class="deleted-badge">
      <i class="pi pi-trash"></i>
      <span>Post usunięty</span>
    </div>

    <div class="post-header">
      <div>
        <div class="meta-info">
          <AvatarComponent :username="post.author?.username" />
          <div class="user-info-col">
            <span class="username">{{ post.author?.username }}</span>
            <span class="date">
              utworzono
              {{ new Date(post.createdAt).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="post.replyTo"
      class="reply-reference"
      @click="scrollToPost(post.replyTo._id)"
    >
      <i class="pi pi-reply"></i>
      <span>Odpowiedź na: {{ post.replyTo.content?.substring(0, 60) }}...</span>
    </div>

    <div class="post-content">{{ post.content }}</div>

    <div v-if="post.tags && post.tags.length > 0" class="post-tags">
      <span
        v-for="tag in post.tags"
        :key="tag._id"
        class="tag-badge"
        :style="{
          background: tag.color,
          boxShadow: `0 2px 8px ${tag.color}40`,
        }"
      >
        {{ tag.name }}
      </span>
    </div>

    <div class="post-footer">
      <Button class="p-button-text" @click="$emit('like', post._id)">
        <i :class="isLiked ? 'pi pi-heart-fill' : 'pi pi-heart'"></i>
        <span>{{ post.likes?.length || 0 }}</span>
      </Button>
      <Button class="p-button-text" @click="$emit('reply', post._id)">
        <i class="pi pi-reply"></i>
        <span>Odpowiedz</span>
      </Button>
      <Button
        v-if="isAuthor"
        class="p-button-text p-button-danger"
        @click="$emit('delete', post._id)"
      >
        <i class="pi pi-trash"></i>
        <span>Usuń</span>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import AvatarComponent from "../../AvatarComponent.vue";
import { useAuthStore } from "../../../stores/auth.js";

const props = defineProps({ post: { required: true } });
defineEmits(["like", "reply", "delete"]);

const authStore = useAuthStore();

const isLiked = computed(() => {
  if (!authStore.user || !props.post.likes) return false;
  return props.post.likes.some(
    (like) => like._id === authStore.user._id || like === authStore.user._id,
  );
});

const isAuthor = computed(() => {
  if (!authStore.user || !props.post.author) return false;

  const authorId =
    typeof props.post.author === "string"
      ? props.post.author
      : props.post.author._id;

  const userId = authStore.user._id || authStore.user.id;

  console.log("jest autorem??:", {
    authorId,
    userId,
    match: authorId === userId,
  });

  return authorId === userId;
});

const scrollToPost = (postId) => {
  const element = document.querySelector(`[data-post-id="${postId}"]`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("highlight-post");
    setTimeout(() => element.classList.remove("highlight-post"), 2000);
  }
};
</script>

<style scoped>
.reply-reference {
  background: #f1f5f9;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid var(--p-primary-color);
  border-radius: 6px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.reply-reference:hover {
  background: #e2e8f0;
}
.post-card {
  padding: 1.5rem;
  transition: transform 0.2s;
  position: relative;
}

.deleted-post {
  opacity: 0.6;
  background: #fef2f2;
  border: 1px dashed #fca5a5;
}

.deleted-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #dc2626;
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  z-index: 10;
}

.deleted-badge i {
  font-size: 0.75rem;
}

.post-header {
  margin-bottom: 1rem;
}

.post-content {
  font-size: 1rem;
  color: #1e293b;
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* zrobić z tagow komponent */
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 16px;
  color: white;
  font-size: 0.85rem;
}

.post-footer {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid #f1f5f9;
}

.highlight-post {
  animation: highlight 2s ease-in-out;
}

@keyframes highlight {
  0%,
  100% {
    background: transparent;
  }
  50% {
    background: #8774ff;
  }
}
</style>
