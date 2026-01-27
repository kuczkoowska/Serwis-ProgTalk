<template>
  <div v-if="posts && posts.length > 0" class="posts-list">
    <TopicPost
      v-for="post in posts"
      :key="post._id"
      :post="post"
      @like="$emit('like', $event)"
      @reply="$emit('reply', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>

  <div v-else class="empty-state">
    <div class="empty-icon-circle">
      <i
        class="pi pi-comments"
        style="font-size: 2rem; color: var(--p-primary-color)"
      ></i>
    </div>
    <h3>Cisza w eterze...</h3>
    <p>Nikt jeszcze nie odpisał. Bądź tą pierwszą osobą!</p>
  </div>

  <div class="topic">
    <TopicReplyEditor
      id="reply-form"
      :loading="sending"
      :replyToId="replyToId"
      :availableTags="tags"
      @submit="$emit('submit', $event)"
      @cancel="$emit('update:replyToId', null)"
    />
  </div>
</template>
<script setup>
import TopicPost from "./TopicPost.vue";
import TopicReplyEditor from "./TopicReplyEditor.vue";

defineProps({
  posts: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  sending: Boolean,
  replyToId: String,
});

defineEmits(["like", "reply", "delete", "submit", "update:replyToId"]);
</script>
<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef0f2;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0;
  color: #334155;
}

.empty-state p {
  color: #64748b;
}
</style>
