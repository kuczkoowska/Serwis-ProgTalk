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

          <div
            v-if="postsStore.loading && postsStore.posts.length === 0"
            class="flex justify-content-center p-5"
          >
            <ProgressSpinner style="width: 40px" />
          </div>

          <TopicPostList
            v-else
            :posts="postsStore.posts"
            :currentUserId="authStore.user?._id"
            :isModerator="topicsStore.canManage"
            @like="handleLike"
            @delete="handleDeletePost"
            @reply="handleReply"
          />

          <Paginator
            v-if="
              postsStore.pagination.hasNextPage ||
              postsStore.pagination.page > 1
            "
            :rows="postsStore.pagination.limit"
            :totalRecords="1000"
            :first="
              (postsStore.pagination.page - 1) * postsStore.pagination.limit
            "
            @page="onPageChange"
            template="PrevPageLink CurrentPageReport NextPageLink"
            class="mt-2"
          />

          <div class="mt-3">
            <Message
              v-if="topicsStore.isBlocked"
              severity="error"
              :closable="false"
              class="w-full"
            >
              <div class="flex align-items-center gap-2">
                <i class="pi pi-ban"></i>
                <span
                  >Zostałeś zablokowany w tym temacie. Nie możesz dodawać
                  postów.</span
                >
              </div>
            </Message>

            <Message
              v-else-if="topicsStore.isClosed && !topicsStore.canManage"
              severity="warn"
              :closable="false"
              class="w-full"
            >
              <div class="flex align-items-center gap-2">
                <i class="pi pi-lock"></i>
                <span>Temat jest zamknięty. Tylko moderatorzy mogą pisać.</span>
              </div>
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
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useTopicsStore } from "../../stores/topics";
import { usePostsStore } from "../../stores/posts";
import { useAuthStore } from "../../stores/auth";
import { useApplicationsStore } from "../../stores/applications";
import { useToastHelper } from "../../composables/useToastHelper";

const route = useRoute();
const topicsStore = useTopicsStore();
const postsStore = usePostsStore();
const authStore = useAuthStore();
const applicationsStore = useApplicationsStore();
const { showSuccess, showError } = useToastHelper();

const sending = ref(false);
const showCreateSubtopic = ref(false);
const showModeratorApp = ref(false);
const hasPendingApplication = ref(false);
const replyToPost = ref(null);

const initView = async (id) => {
  await topicsStore.fetchTopicDetails(id);
  if (topicsStore.error) return;

  await postsStore.fetchPosts(id);

  if (authStore.user && !topicsStore.canManage) {
    const status = await applicationsStore.checkUserApplicationStatus(id);
    hasPendingApplication.value = status.hasPendingApplication;
  }

  topicsStore.initTopicSockets(id);
  postsStore.initPostSockets();
  if (topicsStore.canManage) {
    applicationsStore.initApplicationSockets(id);
  }
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

const onPostSubmit = async (content) => {
  if (!content.trim()) return;

  sending.value = true;
  try {
    const replyId = replyToPost.value ? replyToPost.value._id : null;
    await postsStore.addPost(topicsStore.currentTopic._id, content, replyId);

    showSuccess("Post dodany");
    replyToPost.value = null;

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  } catch (e) {
    showError(e);
  } finally {
    sending.value = false;
  }
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

const onPageChange = (event) => {
  postsStore.fetchPosts(
    topicsStore.currentTopic._id,
    event.page + 1,
    event.rows,
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const onModeratorApplicationSubmitted = () => {
  hasPendingApplication.value = true;
};

const onSubtopicCreated = () => {
  showSuccess("Podtemat utworzony");
};
</script>
