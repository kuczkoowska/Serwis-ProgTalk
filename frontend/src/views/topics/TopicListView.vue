<template>
  <div>
    <Toast />

    <div class="layout-container">
      <div class="header-section">
        <div class="header-text">
          <h1>Strefa Dyskusji</h1>
          <p>Nie wiesz czego szukasz?</p>
          <p>
            Wybierz jedną z poniszych kategorii i dołącz do rozmowy z innymi
            programistami.
          </p>
        </div>
        <Button
          label="Nowy Temat"
          icon="pi pi-plus"
          rounded
          raised
          @click="showCreateDialog = true"
        />
      </div>

      <div class="grid-container">
        <TopicCard
          v-for="topic in topicsStore.rootTopics"
          :key="topic._id"
          :topic="topic"
          @open="goToTopic(topic._id)"
        />
      </div>

      <div v-if="topicsStore.rootTopics.length === 0">
        <BaseEmptyState
          title="Pusto tutaj..."
          description="Bądź legendą i stwórz pierwszy temat w tej kategorii!"
          icon="pi-folder-open"
        >
          <Button label="Stwórz temat" @click="showCreateDialog = true" />
        </BaseEmptyState>
      </div>

      <CreateTopicDialog
        v-model:visible="showCreateDialog"
        @created="topicsStore.fetchRootTopics()"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTopicsStore } from "../../stores/topics";
import { useRouter } from "vue-router";

const topicsStore = useTopicsStore();
const router = useRouter();

const showCreateDialog = ref(false);

onMounted(() => {
  topicsStore.fetchRootTopics();
});

const goToTopic = (id) => {
  router.push(`/topic/${id}`);
};
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}
</style>
