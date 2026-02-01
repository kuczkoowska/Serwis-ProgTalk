<template>
  <div>
    <Toast />

    <div class="layout-container">
      <div class="header-section">
        <div class="header-text">
          <h1>Strefa Dyskusji</h1>
          <p>Wybierz kategorię i dołącz do rozmowy.</p>
        </div>
        <div class="header-actions">
          <Button
            v-if="authStore.isAdmin"
            label="Panel Admina"
            icon="pi pi-shield"
            severity="secondary"
            rounded
            outlined
            @click="$router.push('/admin')"
          />
          <Button
            label="Odśwież"
            icon="pi pi-refresh"
            :badge="hasNewTopics ? '!' : null"
            badgeSeverity="info"
            severity="secondary"
            rounded
            outlined
            @click="refreshTopics"
            :loading="topicsStore.loading"
          />
          <Button
            label="Nowy Temat"
            icon="pi pi-plus"
            rounded
            raised
            @click="showCreateDialog = true"
          />
        </div>
      </div>

      <TopicFilters
        :initial-filters="currentFilters"
        @change="handleFilterChange"
      />

      <BlockUI :blocked="topicsStore.loading">
        <div class="topics-wrapper">
          <div v-if="topicsStore.rootTopics.length > 0">
            <TransitionGroup name="topic-list" tag="div" class="grid-container">
              <TopicCard
                v-for="topic in topicsStore.rootTopics"
                :key="topic._id"
                :topic="topic"
                @open="goToTopic(topic._id)"
              />
            </TransitionGroup>

            <div class="pagination-buttons">
              <Button
                label="Poprzednia"
                icon="pi pi-chevron-left"
                :disabled="topicsStore.pagination.currentPage === 1"
                @click="prevPage"
                outlined
              />

              <span class="page-indicator">
                Strona {{ topicsStore.pagination.currentPage }}
              </span>

              <Button
                label="Następna"
                icon="pi pi-chevron-right"
                iconPos="right"
                :disabled="!topicsStore.hasMoreTopics"
                @click="nextPage"
                outlined
              />
            </div>
          </div>

          <div v-else-if="!topicsStore.loading">
            <BaseEmptyState
              title="Nie znaleziono tematów"
              description="Spróbuj zmienić filtry lub stwórz nowy temat."
              icon="pi-folder-open"
            >
              <Button label="Stwórz temat" @click="showCreateDialog = true" />
            </BaseEmptyState>
          </div>
        </div>
      </BlockUI>
    </div>

    <CreateTopicDialog
      v-model:visible="showCreateDialog"
      @created="onTopicCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { useTopicsStore } from "../../stores/topics";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import { useToastHelper } from "../../composables/useToastHelper";
import socketService from "../../plugins/socket";

const topicsStore = useTopicsStore();
const authStore = useAuthStore();
const router = useRouter();
const { showSuccess } = useToastHelper();

const showCreateDialog = ref(false);
const hasNewTopics = ref(false);

const currentFilters = reactive({
  search: "",
  tags: [],
  sort: "oldest",
  showAllLevels: false,
});

onMounted(async () => {
  await fetchTopics();
  socketService.joinTopicsList();
  socketService.on("new_topic", handleNewTopic);
});

onUnmounted(() => {
  socketService.leaveTopicsList();
  socketService.off("new_topic", handleNewTopic);
});

const fetchTopics = async () => {
  await topicsStore.fetchRootTopics({
    ...currentFilters,
    page: topicsStore.pagination.currentPage,
  });
};

const handleNewTopic = (data) => {
  const isOwnTopic = data.topic?.creator?.username === authStore.user?.username;

  if (!isOwnTopic) {
    hasNewTopics.value = true;
  }
};

const handleFilterChange = (newFilters) => {
  Object.assign(currentFilters, newFilters);

  topicsStore.pagination.currentPage = 1;
  hasNewTopics.value = false;
  fetchTopics();
};

const prevPage = () => {
  if (topicsStore.pagination.currentPage > 1) {
    topicsStore.pagination.currentPage--;
    fetchTopics();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const nextPage = () => {
  if (topicsStore.hasMoreTopics) {
    topicsStore.pagination.currentPage++;
    fetchTopics();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const refreshTopics = async () => {
  hasNewTopics.value = false;
  await fetchTopics();

  showSuccess("Lista tematów została zaktualizowana", "Odświeżono");
};

const onTopicCreated = async () => {
  await topicsStore.fetchRootTopics({ ...currentFilters, page: 1 });

  // przejdz do strony
};

const goToTopic = (id) => {
  router.push(`/topic/${id}`);
};
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.header-text h1 {
  margin: 0;
  color: #343a40;
}
.header-text p {
  margin: 0.5rem 0 0;
  color: #6c757d;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pagination-center {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.topic-list-move,
.topic-list-enter-active,
.topic-list-leave-active {
  transition: all 0.5s ease;
}

.topic-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.topic-list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.topic-list-leave-active {
  position: absolute;
}

.pagination-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.page-indicator {
  font-weight: 600;
  color: var(--text-muted);
}
</style>
