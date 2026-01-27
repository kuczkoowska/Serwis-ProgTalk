<template>
  <div>
    <DataTable
      :value="topics"
      :loading="loading"
      paginator
      :rows="10"
      stripedRows
    >
      <Column field="name" header="Nazwa tematu" sortable></Column>
      <Column field="creator.username" header="Twórca" sortable></Column>
      <Column field="isClosed" header="Status" sortable>
        <template #body="slotProps">
          <div class="status-badges">
            <Tag
              v-if="slotProps.data.isClosed"
              value="Zamknięty"
              severity="danger"
              icon="pi pi-lock"
              class="clickable-tag"
              @click="toggleTopicStatus(slotProps.data)"
              v-tooltip.top="'Kliknij aby otworzyć'"
            />
            <Tag
              v-else
              value="Otwarty"
              severity="success"
              icon="pi pi-lock-open"
              class="clickable-tag"
              @click="toggleTopicStatus(slotProps.data)"
              v-tooltip.top="'Kliknij aby zamknąć'"
            />
            <Tag
              v-if="slotProps.data.isHidden"
              value="Ukryty"
              severity="warning"
              icon="pi pi-eye-slash"
              class="ml-2"
            />
          </div>
        </template>
      </Column>
      <Column field="createdAt" header="Data utworzenia" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.createdAt) }}
        </template>
      </Column>
      <Column header="Akcje">
        <template #body="slotProps">
          <Button
            icon="pi pi-external-link"
            severity="info"
            text
            rounded
            v-tooltip.top="'Przejdź do tematu'"
            @click="goToTopic(slotProps.data._id)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();
const topics = ref([]);
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await axios.get("/api/admin/topics");
    topics.value = res.data.data.topics;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: "Nie udało się pobrać tematów",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const toggleTopicStatus = async (topic) => {
  try {
    const action = topic.isClosed ? "open" : "close";
    await axios.patch(`/api/topics/${topic._id}/${action}`);

    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: `Temat został ${topic.isClosed ? "otwarty" : "zamknięty"}`,
      life: 3000,
    });

    fetchData();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail:
        err.response?.data?.message || "Nie udało się zmienić statusu tematu",
      life: 3000,
    });
  }
};

const goToTopic = (topicId) => {
  router.push({
    path: `/topic/${topicId}`,
    query: { returnTo: "admin" },
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const refresh = () => {
  fetchData();
};

defineExpose({
  refresh,
});

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.clickable-tag {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable-tag:hover {
  opacity: 0.8;
}
.status-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}
</style>
