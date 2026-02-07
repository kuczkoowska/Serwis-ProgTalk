<template>
  <div class="layout-wrapper">
    <Toast />

    <TopicBreadcrumb
      v-if="currentTopic"
      :topic="currentTopic"
      :homeItem="homeItem"
    />

    <div v-if="loading && !currentTopic" class="loading-container">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="currentTopic"
      class="main-container"
      :class="{ 'loading-overlay': loading }"
    >
      <div v-if="loading" class="loading-indicator">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      </div>

      <TopicHeader :topic="currentTopic" />

      <TopicPagination
        v-if="postsStore.posts.length > 0"
        :currentPage="currentPage"
        :hasNextPage="postsStore.pagination.hasNextPage"
        :topicId="route.params.id"
        :rowsPerPage="rowsPerPage"
        @page-change="handlePageChange"
        @rows-per-page-change="handleRowsPerPageChange"
      />

      <div class="layout-with-sidebar">
        <div class="posts-column">
          <TopicPostList
            :posts="postsStore.posts"
            :tags="tagsStore.tags"
            :sending="sending"
            :replyToId="replyToId"
            :canPost="topicsStore.canPost"
            :topicClosed="currentTopic?.isClosed || false"
            :isBlocked="topicsStore.isBlocked"
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

          <ModerationCard v-if="currentTopic" :topic="currentTopic" />

          <Message
            v-if="
              hasPendingApplication &&
              !topicsStore.canManage &&
              authStore.user?.role !== 'admin'
            "
            severity="info"
            :closable="false"
            class="mt-2"
          >
            Twoje zgłoszenie na moderatora oczekuje na rozpatrzenie
          </Message>

          <Button
            v-if="canApplyForModerator"
            label="Zgłoś się na moderatora"
            icon="pi pi-user-plus"
            severity="secondary"
            outlined
            fluid
            class="mt-2"
            @click="showModeratorApplicationDialog = true"
          />

          <TagManagementCard
            :topicId="route.params.id"
            :moderators="currentTopic?.moderators || []"
          />

          <Button
            label="Wróć do listy"
            icon="pi pi-arrow-left"
            text
            fluid
            class="mt-3"
            @click="$router.push('/')"
          />

          <Button
            v-if="authStore.user?.role === 'admin'"
            label="Panel Admina"
            icon="pi pi-shield"
            severity="secondary"
            text
            fluid
            class="mt-2"
            @click="$router.push('/admin')"
          />
        </div>
      </div>
    </div>

    <CreateTopicDialog
      v-model:visible="showSubtopicDialog"
      :parentId="route.params.id"
      @created="onSubtopicCreated"
    />

    <ModeratorApplicationDialog
      v-model="showModeratorApplicationDialog"
      :topicId="route.params.id"
      @submitted="onModeratorApplicationSubmitted"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToastHelper } from "../../composables/useToastHelper";
import { useTopicSocketHandlers } from "../../composables/topic/useTopicSocketHandlers";
import TopicBreadcrumb from "../../components/topic/TopicBreadcrumb.vue";
import TopicPagination from "../../components/topic/TopicPagination.vue";

import api from "../../plugins/axios";
import { useTopicsStore } from "../../stores/topics.js";
import { usePostsStore } from "../../stores/posts.js";
import { useTagsStore } from "../../stores/tags.js";
import { useAuthStore } from "../../stores/auth.js";
import { useApplicationsStore } from "../../stores/applications.js";

const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useToastHelper();

const topicsStore = useTopicsStore();
const postsStore = usePostsStore();
const tagsStore = useTagsStore();
const authStore = useAuthStore();
const applicationsStore = useApplicationsStore();

const sending = ref(false);
const showSubtopicDialog = ref(false);
const showModeratorApplicationDialog = ref(false);
const hasPendingApplication = ref(false);
const replyToId = ref(null);
const rowsPerPage = ref(10);
const waitingForOwnPost = ref(false);
const ownPostId = ref(null);
const loading = ref(false);

const currentTopicId = computed(() => route.params.id);
const currentTopic = computed(() => topicsStore.currentTopic);
const currentPage = computed(() => postsStore.pagination.page || 1);

const homeItem = ref({ icon: "pi pi-home", command: () => router.push("/") });

const canApplyForModerator = computed(() => {
  if (!authStore.user || !currentTopic.value) return false;
  if (authStore.user.role === "admin") return false;
  if (topicsStore.canManage) return false;
  if (currentTopic.value.isClosed || currentTopic.value.isHidden) return false;
  if (hasPendingApplication.value) return false;
  return true;
});

const loadAllData = async (id, initialPage = null) => {
  if (!id) return;

  loading.value = true;
  try {
    postsStore.posts = [];
    await topicsStore.fetchTopicDetails(id);

    let startPage = initialPage || 1;
    if (authStore.user && !initialPage) {
      try {
        const response = await api.get(`/users/last-viewed-page/${id}`);
        startPage = response.data.data.page || 1;
      } catch (e) {
        console.log("Nie udało się pobrać ostatniej strony", e);
      }
    }

    await postsStore.fetchPosts(id, startPage, rowsPerPage.value);
    await tagsStore.fetchTagsForTopic(id);

    if (authStore.user) {
      const status = await applicationsStore.checkUserApplicationStatus(id);
      hasPendingApplication.value = status.hasPendingApplication;
    }
  } finally {
    loading.value = false;
  }
};

postsStore.waitingForOwnPost = waitingForOwnPost;
postsStore.ownPostId = ownPostId;

const { setupSocketListeners } = useTopicSocketHandlers(
  topicsStore,
  postsStore,
  authStore,
);
const cleanup = setupSocketListeners(currentTopicId);

onUnmounted(() => {
  if (cleanup) cleanup();
});

onMounted(() => {
  loadAllData(route.params.id);
});

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (!oldId || oldId === newId) return;
    await loadAllData(newId);
    window.scrollTo(0, 0);
  },
);

const handlePageChange = async (newPage) => {
  await postsStore.fetchPosts(route.params.id, newPage, rowsPerPage.value);
};

const handleRowsPerPageChange = async (newRowsPerPage) => {
  rowsPerPage.value = newRowsPerPage;
  await postsStore.fetchPosts(route.params.id, 1, rowsPerPage.value);
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
  } catch (error) {
    showError(error);
  }
};

const handleDelete = async (postId) => {
  try {
    await postsStore.deletePost(postId);
    await postsStore.fetchPosts(route.params.id);
  } catch (e) {
    const msg =
      e?.response?.data?.message || e?.message || "Nie udało się usunąć posta";
    showError(msg);
  }
};

const handleAddPost = async (data) => {
  sending.value = true;
  try {
    const content = typeof data === "string" ? data : data.content;
    const tags = typeof data === "object" ? data.tags : [];

    waitingForOwnPost.value = true;

    await postsStore.addPost(route.params.id, content, replyToId.value, tags);

    replyToId.value = null;
    showSuccess("Post zostanie dodany za chwilę...", "Wysłano");
  } catch (e) {
    waitingForOwnPost.value = false;
    const msg = e?.response?.data?.message || e?.message || "Błąd wysyłania";
    showError(msg);
  } finally {
    sending.value = false;
  }
};

const onModeratorApplicationSubmitted = async () => {
  showSuccess("Aplikacja wysłana!");
  const status = await applicationsStore.checkUserApplicationStatus(
    route.params.id,
  );
  hasPendingApplication.value = status.hasPendingApplication;
};

const onSubtopicCreated = async () => {
  await topicsStore.fetchTopicDetails(route.params.id);

  showSuccess("Nowy podtemat został dodany", "Podtemat utworzony");
};
</script>

<style scoped>
.main-container {
  position: relative;
}

.main-container.loading-overlay {
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.loading-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.layout-with-sidebar {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
}
</style>
