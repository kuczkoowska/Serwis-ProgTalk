<template>
  <div class="layout-wrapper">
    <Toast />

    <div class="back-button">
      <Button
        :label="
          route.query.returnTo === 'admin'
            ? 'Wróć do panelu admina'
            : 'Wróć do listy'
        "
        icon="pi pi-arrow-left"
        text
        fluid
        class="mt-3"
        @click="goBack"
      />
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else class="main-container">
      <TopicHeader :topic="currentTopic" />

      <div class="pagination-container">
        <Paginator
          :rows="rowsPerPage"
          :totalRecords="postsStore.pagination.totalPosts"
          :rowsPerPageOptions="[5, 10, 20]"
          :first="currentFirstIndex"
          @page="onPageChange"
        />
      </div>

      <div class="layout-with-sidebar">
        <div class="posts-column">
          <TopicPostList
            :posts="postsStore.posts"
            :tags="tagsStore.tags"
            :sending="sending"
            :replyToId="replyToId"
            @like="handleLike"
            @reply="handleReply"
            @delete="handleDelete"
            @submit="handleAddPost"
            @update:replyToId="replyToId = $event"
          />
        </div>

        <div class="sidebar-column">
          <SubtopicsCard
            :subtopics="topicsStore.subtopics"
            @create="showSubtopicDialog = true"
          />

          <ModerationCard :topic="currentTopic" />

          <TagManagementCard
            :topicId="route.params.id"
            :moderators="currentTopic?.moderators || []"
          />

          <TopicStatsCard :postsCount="postsStore.totalPosts" />

          <Button
            label="Wróć do listy"
            icon="pi pi-arrow-left"
            text
            fluid
            class="mt-3"
            @click="$router.push('/')"
          />
        </div>
      </div>
    </div>

    <CreateTopicDialog
      v-model:visible="showSubtopicDialog"
      :parentId="route.params.id"
      @created="refreshData"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

import { useTopicsStore } from "../../stores/topics.js";
import { usePostsStore } from "../../stores/posts.js";
import { useTagsStore } from "../../stores/tags.js";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const topicsStore = useTopicsStore();
const postsStore = usePostsStore();
const tagsStore = useTagsStore();

const sending = ref(false);
const showSubtopicDialog = ref(false);
const replyToId = ref(null);
const rowsPerPage = ref(10);

const currentTopic = computed(() => topicsStore.currentTopic);
const loading = computed(() => topicsStore.loading || postsStore.loading);
const currentFirstIndex = computed(() => {
  const page = postsStore.pagination.page || 1;
  return (page - 1) * rowsPerPage.value;
});

const loadAllData = async (id) => {
  if (!id) return;
  await topicsStore.fetchTopicDetails(id);
  await postsStore.fetchPosts(id);
  await tagsStore.fetchTagsForTopic(id);
};

const goBack = () => {
  if (route.query.returnTo === "admin") {
    router.push("/admin");
  } else {
    router.push("/");
  }
};

const refreshData = () => loadAllData(route.params.id);

onMounted(() => loadAllData(route.params.id));

watch(
  () => route.params.id,
  (newId) => {
    loadAllData(newId);
    window.scrollTo(0, 0);
  },
);

const onPageChange = (event) => {
  const newPage = event.page + 1;

  rowsPerPage.value = event.rows;

  postsStore.fetchPosts(route.params.id, newPage, rowsPerPage.value);

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const focusEditor = () => {
  document.getElementById("reply-form").scrollIntoView({ behavior: "smooth" });
};

const handleReply = (postId) => {
  replyToId.value = postId;
  focusEditor();
};

const handleLike = async (postId) => {
  try {
    await postsStore.toggleLike(postId);
  } catch (e) {
    showError(e, "Nie udało się polubić");
  }
};

const handleDelete = async (postId) => {
  try {
    await postsStore.deletePost(postId);
    await postsStore.fetchPosts(route.params.id);
    toast.add({
      severity: "success",
      summary: "Usunięto",
      detail: "Post został usunięty",
      life: 3000,
    });
  } catch (e) {
    showError(e, "Nie udało się usunąć posta");
  }
};

const handleAddPost = async (data) => {
  sending.value = true;
  try {
    const content = typeof data === "string" ? data : data.content;
    const tags = typeof data === "object" ? data.tags : [];
    await postsStore.addPost(route.params.id, content, replyToId.value, tags);
    await postsStore.fetchPosts(route.params.id);
    replyToId.value = null;
    toast.add({
      severity: "success",
      summary: "Wysłano",
      detail: "Post dodany!",
      life: 3000,
    });
  } catch (e) {
    showError(e, "Błąd wysyłania");
  } finally {
    sending.value = false;
  }
};

const showError = (error, defaultMsg) => {
  const msg = error?.response?.data?.message || error?.message || defaultMsg;
  toast.add({ severity: "error", summary: "Błąd", detail: msg, life: 3000 });
};
</script>

<style scoped>
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.back-button {
  max-width: 200px;
}
</style>
