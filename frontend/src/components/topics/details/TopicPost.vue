<template>
  <div class="custom-card post-card mb-3">
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

    <div class="post-content" v-html="formatContent(post.content)"></div>

    <div class="post-footer">
      <Button
        :icon="isLiked ? 'pi pi-heart-fill' : 'pi pi-heart'"
        :label="post.likes.length > 0 ? post.likes.length.toString() : ''"
        :class="isLiked ? 'liked-btn' : 'action-btn'"
        text
        rounded
        @click="$emit('like', post._id)"
      />
      <Button
        icon="pi pi-reply"
        label="Odpowiedz"
        class="action-btn"
        text
        rounded
        @click="$emit('reply')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../../stores/auth";
import AvatarComponent from "../../AvatarComponent.vue";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

defineEmits(["like", "reply"]);

const authStore = useAuthStore();

const isLiked = computed(() => {
  const userId = authStore.user?._id;
  return props.post.likes.some(
    (like) => (typeof like === "string" ? like : like._id) === userId,
  );
});

const formatContent = (text) => {
  if (!text) return "";
  return text.replace(/\n/g, "<br>");
};
</script>

<style scoped>
.post-card {
  padding: 1.5rem;
  transition: transform 0.2s;
}
.post-header {
  margin-bottom: 1rem;
}
.post-content {
  font-size: 1rem;
  color: #1e293b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.post-footer {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid #f1f5f9;
}
</style>
