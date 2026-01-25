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
          class="create-btn"
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

      <div v-if="topicsStore.rootTopics.length === 0" class="empty-state">
        <h3>Pusto tutaj...</h3>
        <p>Bądź legendą i stwórz pierwszy temat!</p>
        <Button label="Stwórz temat" text @click="showCreateDialog = true" />
      </div>

      <CreateTopicDialog
        v-model:visible="showCreateDialog"
        @created="refreshData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTopicsStore } from "../../stores/topics";
import { useRouter } from "vue-router";

import TopicCard from "../../components/topics/general/TopicCard.vue";
import CreateTopicDialog from "./components/CreateTopicDialog.vue";

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
.layout-container {
  padding: 2rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.header-text h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0;
}
.header-text p {
  color: #6c757d;
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}
.create-btn {
  padding: 0.8rem 1.5rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  border: 2px dashed #dee2e6;
}

.empty-state h3 {
  margin: 0;
  color: #343a40;
}
.empty-state p {
  color: #6c757d;
  margin-bottom: 2rem;
}
</style>
