<template>
  <div v-if="posts && posts.length > 0" class="posts-list">
    <TopicPost
      v-for="post in posts"
      :key="post._id"
      :post="post"
      :canPost="canPost"
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

  <div class="topic" v-if="canPost">
    <TopicReplyEditor
      id="reply-form"
      :loading="sending"
      :replyToId="replyToId"
      :availableTags="tags"
      @submit="$emit('submit', $event)"
      @cancel="$emit('update:replyToId', null)"
    />
  </div>

  <div v-else class="custom-card mt-3 text-center">
    <Message severity="warn" :closable="false">
      {{ canPostMessage }}
    </Message>
  </div>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  posts: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  sending: Boolean,
  replyToId: String,
  canPost: Boolean,
  topicClosed: Boolean,
  isBlocked: Boolean,
});

const emit = defineEmits([
  "like",
  "reply",
  "delete",
  "submit",
  "update:replyToId",
]);

const canPostMessage = computed(() => {
  if (props.isBlocked) {
    return "Jesteś zablokowany w tym temacie. Nie możesz dodawać postów, odpowiadać ani lajkować.";
  }
  if (props.topicClosed) {
    return "Ten temat został zamknięty. Nie można dodawać nowych wpisów.";
  }
  return "Nie masz uprawnień do pisania w tym temacie.";
});
</script>
