<template>
  <div class="layout-container max-w-7xl mx-auto p-4">
    <Toast />

    <div
      v-if="topicsStore.loading && !topicsStore.currentTopic"
      class="flex justify-content-center align-items-center h-20rem"
    >
      <ProgressSpinner />
    </div>

    <div
      v-else-if="topicsStore.error"
      class="flex flex-column align-items-center justify-content-center h-20rem text-center"
    >
      <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
      <h3 class="text-900 m-0 mb-2">Wystąpił problem</h3>
      <p class="text-600 mb-4">{{ topicsStore.error }}</p>
      <Button
        label="Wróć do listy tematów"
        icon="pi pi-arrow-left"
        @click="$router.push('/')"
      />
    </div>

    <div v-else-if="topicsStore.currentTopic" class="flex flex-column gap-4">
      <TopicBreadcrumb :topic="topicsStore.currentTopic" />

      <div class="grid">
        <div class="col-12 lg:col-9 flex flex-column gap-4">
          <TopicHeader :topic="topicsStore.currentTopic" />

          <div class="relative">
            <div
              v-if="postsStore.loading"
              class="absolute top-0 left-0 w-full h-full bg-white-alpha-80 z-5 flex justify-content-center pt-5"
              style="min-height: 200px"
            >
              <ProgressSpinner style="width: 40px" />
            </div>

            <TopicPostList
              :posts="postsStore.posts"
              :currentUserId="authStore.user?._id"
              :isModerator="topicsStore.canManage"
              @like="handleLike"
              @delete="handleDeletePost"
              @reply="handleReply"
            />

            <div id="bottom-anchor"></div>
          </div>

          <div
            v-if="postsStore.pagination.totalPages > 1"
            class="flex justify-content-between align-items-center mt-2 px-2 border-top-1 border-gray-200 pt-3"
          >
            <Button
              label="Wcześniejsze"
              icon="pi pi-arrow-left"
              text
              :disabled="
                !postsStore.pagination.hasPrevPage || postsStore.loading
              "
              @click="loadPage(postsStore.pagination.page - 1)"
            />

            <span class="text-sm text-500 hidden md:block">
              Strona {{ postsStore.pagination.page }} z
              {{ postsStore.pagination.totalPages }}
            </span>

            <Button
              label="Nowsze"
              icon="pi pi-arrow-right"
              iconPos="right"
              text
              :disabled="
                !postsStore.pagination.hasNextPage || postsStore.loading
              "
              @click="loadPage(postsStore.pagination.page + 1)"
            />
          </div>

          <div class="mt-3">
            <Message
              v-if="topicsStore.isBlocked"
              severity="error"
              :closable="false"
            >
              Zostałeś zablokowany w tym temacie.
            </Message>

            <Message
              v-else-if="topicsStore.isClosed && !topicsStore.canManage"
              severity="warn"
              :closable="false"
            >
              Temat zamknięty. Tylko moderatorzy mogą pisać.
            </Message>

            <div v-else id="post-editor-section">
              <div
                v-if="replyToPost"
                class="flex align-items-center justify-content-between bg-primary-50 p-3 border-round mb-2 border-left-3 border-primary"
              >
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-reply text-primary"></i>
                  <span class="text-sm text-700">
                    Odpowiedź do:
                    <strong>{{ replyToPost.author?.username }}</strong>
                  </span>
                </div>
                <Button
                  icon="pi pi-times"
                  text
                  rounded
                  size="small"
                  severity="secondary"
                  @click="replyToPost = null"
                />
              </div>

              <PostEditor
                :loading="sending"
                :placeholder="
                  replyToPost
                    ? 'Napisz odpowiedź...'
                    : 'Napisz coś w tym temacie...'
                "
                @submit="onPostSubmit"
              />
            </div>
          </div>
        </div>

        <div class="col-12 lg:col-3 flex flex-column gap-4">
          <SubtopicsCard
            :subtopics="topicsStore.subtopics"
            @create="showCreateSubtopic = true"
          />
          <TagManagementCard :topicId="topicsStore.currentTopic._id" />
          <ModerationCard
            v-if="topicsStore.canManage"
            :topic="topicsStore.currentTopic"
          />

          <div v-else-if="authStore.isAuthenticated && !topicsStore.isBlocked">
            <div
              class="surface-card p-3 border-round shadow-1 border-1 surface-border"
            >
              <div class="font-bold mb-2 text-900">Rekrutacja</div>
              <p class="text-sm text-600 mb-3">
                Chcesz pomóc w prowadzeniu tego tematu?
              </p>
              <Button
                v-if="!hasPendingApplication"
                label="Zostań moderatorem"
                icon="pi pi-star"
                severity="help"
                outlined
                fluid
                @click="showModeratorApp = true"
              />
              <Message
                v-else
                severity="info"
                :closable="false"
                class="m-0 text-sm"
              >
                Twoje zgłoszenie oczekuje na decyzję.
              </Message>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CreateTopicDialog
      v-model:visible="showCreateSubtopic"
      :parentId="topicsStore.currentTopic?._id"
      @created="onSubtopicCreated"
    />
    <ModeratorApplicationDialog
      v-model:visible="showModeratorApp"
      :topicId="topicsStore.currentTopic?._id"
      @submitted="onModeratorApplicationSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useTopicsStore } from "../../stores/topics";
import { usePostsStore } from "../../stores/posts";
import { useAuthStore } from "../../stores/auth";
import { useApplicationsStore } from "../../stores/applications";
import { useUserStore } from "../../stores/user";
import { useToastHelper } from "../../composables/useToastHelper";

const route = useRoute();
const topicsStore = useTopicsStore();
const postsStore = usePostsStore();
const authStore = useAuthStore();
const applicationsStore = useApplicationsStore();
const userStore = useUserStore();
const { showSuccess, showError } = useToastHelper();

const sending = ref(false);
const showCreateSubtopic = ref(false);
const showModeratorApp = ref(false);
const hasPendingApplication = ref(false);
const replyToPost = ref(null);

const initView = async (id) => {
  await topicsStore.fetchTopicDetails(id);
  if (topicsStore.error) return;

  let pageToLoad = 1;
  if (authStore.isAuthenticated) {
    try {
      const savedPage = await userStore.getLastViewedPage(id);
      if (savedPage && savedPage > 1) pageToLoad = savedPage;
    } catch (e) {}
  }

  await postsStore.fetchPosts(id, pageToLoad);

  if (authStore.user && !topicsStore.canManage) {
    const status = await applicationsStore.checkUserApplicationStatus(id);
    hasPendingApplication.value = status.hasPendingApplication;
  }

  topicsStore.initTopicSockets(id);
  postsStore.initPostSockets();
  if (topicsStore.canManage) applicationsStore.initApplicationSockets(id);
};

onMounted(() => {
  if (route.params.id) initView(route.params.id);
});

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (oldId) {
      topicsStore.cleanupTopicSockets(oldId);
      postsStore.cleanupPostSockets();
      applicationsStore.cleanupApplicationSockets();
    }
    if (newId) {
      replyToPost.value = null;
      initView(newId);
    }
  },
);

onUnmounted(() => {
  if (route.params.id) {
    topicsStore.cleanupTopicSockets(route.params.id);
    postsStore.cleanupPostSockets();
    applicationsStore.cleanupApplicationSockets();
  }
  topicsStore.clearCurrentTopic();
  postsStore.clearPosts();
});

const onPostSubmit = async (payload) => {
  const content = typeof payload === "object" ? payload.content : payload;
  const tags = typeof payload === "object" ? payload.tags : [];

  if (!content || !content.trim()) return;

  sending.value = true;
  try {
    const replyId = replyToPost.value ? replyToPost.value._id : null;

    await postsStore.addPost(
      topicsStore.currentTopic._id,
      content,
      replyId,
      tags,
    );

    showSuccess("Post dodany");
    replyToPost.value = null;

    await postsStore.fetchLastPage(topicsStore.currentTopic._id);

    await nextTick();
    const anchor = document.getElementById("bottom-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  } catch (e) {
    showError(e);
  } finally {
    sending.value = false;
  }
};

const loadPage = async (newPage) => {
  if (newPage < 1) return;

  await postsStore.fetchPosts(
    topicsStore.currentTopic._id,
    newPage,
    postsStore.pagination.limit,
  );

  if (authStore.isAuthenticated) {
    userStore.saveLastViewedPage(topicsStore.currentTopic._id, newPage);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleLike = async (postId) => {
  if (!authStore.isAuthenticated) return showError("Musisz być zalogowany");
  try {
    await postsStore.toggleLike(postId);
  } catch (e) {
    showError(e);
  }
};

const handleDeletePost = async (postId) => {
  if (!confirm("Czy na pewno chcesz usunąć ten post?")) return;
  try {
    await postsStore.deletePost(postId);
    showSuccess("Post usunięty");
  } catch (e) {
    showError(e);
  }
};

const handleReply = (post) => {
  replyToPost.value = post;
  const editor = document.getElementById("post-editor-section");
  if (editor) editor.scrollIntoView({ behavior: "smooth" });
};

const onModeratorApplicationSubmitted = () => {
  hasPendingApplication.value = true;
};
const onSubtopicCreated = () => {
  showSuccess("Podtemat utworzony");
};
</script>
