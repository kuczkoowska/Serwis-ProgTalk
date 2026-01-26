<template>
  <div class="layout-wrapper">
    <Toast />

    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else class="topic-container">
      <TopicHeader :topic="currentTopic" />

      <div class="main-grid">
        <div class="posts-column">
          <div v-if="postsStore.posts.length > 0" class="posts-list">
            <TopicPost
              v-for="post in postsStore.posts"
              :key="post._id"
              :post="post"
              @like="handleLike"
              @reply="handleReply"
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
              @submit="handleAddPost"
              @cancel="replyToId = null"
            />
          </div>
        </div>

        <div class="sidebar-column">
          <SubtopicsCard
            :subtopics="topicsStore.subtopics"
            @create="showSubtopicDialog = true"
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
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useTopicsStore } from "../../stores/topics.js";
import { usePostsStore } from "../../stores/posts.js";
import CreateTopicDialog from "../../components/topics/shared/CreateTopicDialog.vue";
import TopicStatsCard from "../../components/topics/details/TopicStatsCard.vue";
import SubtopicsCard from "../../components/topics/details/SubtopicsCard.vue";
import TopicReplyEditor from "../../components/topics/details/TopicReplyEditor.vue";
import TopicPost from "../../components/topics/details/TopicPost.vue";
import TopicHeader from "../../components/topics/details/TopicHeader.vue";

const route = useRoute();
const topicsStore = useTopicsStore();
const postsStore = usePostsStore();
const toast = useToast();

const sending = ref(false);
const showSubtopicDialog = ref(false);
const replyToId = ref(null);

const currentTopic = computed(() => topicsStore.currentTopic);
const loading = computed(() => topicsStore.loading || postsStore.loading);

const loadAllData = async (id) => {
  if (!id) return;
  await topicsStore.fetchTopicDetails(id);
  await postsStore.fetchPosts(id);
};

onMounted(() => loadAllData(route.params.id));

watch(
  () => route.params.id,
  (newId) => {
    loadAllData(newId);
    window.scrollTo(0, 0);
  },
);

const handleLike = async (postId) => {
  try {
    await postsStore.toggleLike(postId);
    await postsStore.fetchPosts(route.params.id);
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: e || "Nie udało się polubić",
      life: 3000,
    });
  }
};

const handleReply = (postId) => {
  replyToId.value = postId;
  focusEditor();
};

const handleAddPost = async (content) => {
  sending.value = true;
  try {
    await postsStore.addPost(route.params.id, content, replyToId.value);
    await postsStore.fetchPosts(route.params.id);
    replyToId.value = null;
    toast.add({
      severity: "success",
      summary: "Wysłano",
      detail: "Post dodany!",
      life: 3000,
    });
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: e || "Błąd wysyłania",
      life: 3000,
    });
  } finally {
    sending.value = false;
  }
};

const focusEditor = () => {
  document.getElementById("reply-form").scrollIntoView({ behavior: "smooth" });
};

const refreshData = () => loadAllData(route.params.id);
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  padding-top: 5rem;
}

.topic-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.main-grid {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

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

.topic {
  margin-top: 2rem;
}

.empty-state h3 {
  margin: 0;
  color: #334155;
}

.empty-state p {
  color: #64748b;
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
