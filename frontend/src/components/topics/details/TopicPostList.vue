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

  <BaseEmptyState
    v-else
    title="Cisza w eterze..."
    description="Nikt jeszcze nie odpisał. Bądź tą pierwszą osobą!"
    icon="pi-comments"
  />

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
defineProps({
  posts: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  sending: Boolean,
  replyToId: String,
});

defineEmits(["like", "reply", "delete", "submit", "update:replyToId"]);
</script>
