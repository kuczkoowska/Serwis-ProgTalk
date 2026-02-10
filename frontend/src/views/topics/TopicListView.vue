<template>
  <div class="topic-list-view">
    <Toast />

    <div class="header-container">
      <div>
        <h1 class="text-2xl font-bold mb-1">Strefa Dyskusji</h1>
        <p class="text-gray-500 m-0">Dołącz do rozmowy lub rozpocznij nową.</p>
      </div>

      <div class="flex gap-2">
        <Button
          label="Odśwież"
          icon="pi pi-refresh"
          :severity="topicsStore.hasNewTopics ? 'warn' : 'secondary'"
          :badge="topicsStore.hasNewTopics ? '!' : null"
          outlined
          @click="refreshList"
          :loading="topicsStore.loading"
        />
        <Button
          label="Nowy Temat"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <TopicFilters
      v-model:filters="topicsStore.searchFilters"
      @change="handleFilterChange"
      class="mb-4"
    />

    <div
      v-if="topicsStore.loading && topicsStore.rootTopics.length === 0"
      class="flex justify-center p-5"
    >
      <ProgressSpinner />
    </div>

    <div v-else-if="topicsStore.rootTopics.length > 0" class="topics-grid">
      <TopicCard
        v-for="topic in topicsStore.rootTopics"
        :key="topic._id"
        :topic="topic"
        @open="goToTopic(topic._id)"
      />
    </div>

    <div v-else class="text-center p-5">
      <i class="pi pi-folder-open text-4xl text-gray-300 mb-3"></i>
      <p>Nie znaleziono tematów dla wybranych filtrów.</p>
    </div>

    <div v-if="topicsStore.rootTopics.length > 0" class="pagination-container">
      <Button
        icon="pi pi-chevron-left"
        text
        :disabled="topicsStore.pagination.currentPage === 1"
        @click="changePage(-1)"
      />
      <span class="font-bold mx-3">
        Strona {{ topicsStore.pagination.currentPage }}
      </span>
      <Button
        icon="pi pi-chevron-right"
        text
        :disabled="!topicsStore.hasMoreTopics"
        @click="changePage(1)"
      />
    </div>

    <CreateTopicDialog
      v-model:visible="showCreateDialog"
      @created="handleTopicCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useTopicsStore } from "../../stores/topics";
import { useRouter } from "vue-router";
import { useToastHelper } from "../../composables/useToastHelper";

const router = useRouter();
const topicsStore = useTopicsStore();
const { showSuccess } = useToastHelper();

const showCreateDialog = ref(false);

onMounted(() => {
  topicsStore.fetchRootTopics();
  topicsStore.subscribeToTopicsList();
});

onUnmounted(() => {
  topicsStore.unsubscribeFromTopicsList();
});

const refreshList = async () => {
  await topicsStore.fetchRootTopics();
  showSuccess("Lista odświeżona");
};

const handleFilterChange = () => {
  topicsStore.pagination.currentPage = 1;
  topicsStore.fetchRootTopics();
};

const changePage = (delta) => {
  topicsStore.pagination.currentPage += delta;
  topicsStore.fetchRootTopics();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleTopicCreated = () => {
  showSuccess("Temat został utworzony");
};

const goToTopic = (id) => {
  router.push(`/topic/${id}`);
};
</script>

<style scoped>
.topic-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}
</style>
