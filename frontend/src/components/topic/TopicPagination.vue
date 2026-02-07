<template>
  <div class="pagination-container">
    <div class="pagination-controls">
      <Button
        icon="pi pi-angle-left"
        :disabled="currentPage === 1"
        @click="goToPreviousPage"
        label="Poprzednia"
        outlined
      />
      <span class="page-info">Strona {{ currentPage }}</span>
      <Button
        icon="pi pi-angle-right"
        iconPos="right"
        :disabled="!hasNextPage"
        @click="goToNextPage"
        label="Następna"
        outlined
      />
      <Select
        v-model="rowsPerPageModel"
        :options="[5, 10, 20]"
        @change="onRowsPerPageChange"
        placeholder="Wpisów na stronę"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import api from '../../plugins/axios';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  hasNextPage: {
    type: Boolean,
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  rowsPerPage: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(['page-change', 'rows-per-page-change']);
const authStore = useAuthStore();
const rowsPerPageModel = ref(props.rowsPerPage);

watch(() => props.rowsPerPage, (newValue) => {
  rowsPerPageModel.value = newValue;
});

const goToNextPage = async () => {
  const newPage = props.currentPage + 1;
  emit('page-change', newPage);
  
  if (authStore.user) {
    try {
      await api.post("/users/last-viewed-page", {
        topicId: props.topicId,
        page: newPage,
      });
    } catch (e) {
      console.log("Nie udało się zapisać ostatniej strony", e);
    }
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const goToPreviousPage = async () => {
  const newPage = props.currentPage - 1;
  if (newPage < 1) return;
  
  emit('page-change', newPage);
  
  if (authStore.user) {
    try {
      await api.post("/users/last-viewed-page", {
        topicId: props.topicId,
        page: newPage,
      });
    } catch (e) {
      console.log("Nie udało się zapisać ostatniej strony", e);
    }
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const onRowsPerPageChange = () => {
  emit('rows-per-page-change', rowsPerPageModel.value);
};
</script>

<style scoped>
.pagination-container {
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.page-info {
  font-weight: 600;
}
</style>