<template>
  <div class="posts-wrapper">
    <div v-if="posts && posts.length > 0" class="flex flex-column gap-3">
      <TopicPost
        v-for="post in posts"
        :key="post._id"
        :post="post"
        :currentUserId="currentUserId"
        :isModerator="isModerator"
        :isAdmin="isAdmin"
        @like="$emit('like', $event)"
        @reply="$emit('reply', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

    <div
      v-else
      class="surface-card p-5 text-center border-round shadow-1 border-1 surface-border"
    >
      <i class="pi pi-comments text-4xl text-500 mb-3"></i>
      <p class="text-600 m-0">Brak wpisów. Rozpocznij dyskusję!</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../../../stores/auth";

const props = defineProps({
  posts: { type: Array, default: () => [] },
  currentUserId: String,
  isModerator: Boolean,
});

defineEmits(["like", "reply", "delete"]);

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === "admin");
</script>
