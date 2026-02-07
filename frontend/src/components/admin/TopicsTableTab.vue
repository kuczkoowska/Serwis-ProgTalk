<template>
  <div>
    <DataTable
      :value="adminStore.topics"
      :loading="adminStore.loading"
      paginator
      :rows="10"
      stripedRows
    >
      <Column field="name" header="Nazwa tematu" sortable></Column>
      <Column field="creator.username" header="Twórca" sortable>
        <template #body="{ data }">
          {{ data.creator?.username || "Nieznany" }}
        </template>
      </Column>
      <Column field="isClosed" header="Status" sortable>
        <template #body="{ data }">
          <div class="status-badges">
            <Tag
              :value="data.isClosed ? 'Zamknięty' : 'Otwarty'"
              :severity="data.isClosed ? 'danger' : 'success'"
              :icon="data.isClosed ? 'pi pi-lock' : 'pi pi-lock-open'"
              class="clickable-tag"
              v-tooltip.top="'Kliknij, aby zmienić status'"
              @click="handleToggleStatus(data)"
            />

            <Tag
              v-if="data.isHidden"
              value="Ukryty"
              severity="warning"
              icon="pi pi-eye-slash"
            />
          </div>
        </template>
      </Column>
      <Column field="createdAt" header="Data utworzenia" sortable>
        <template #body="{ data }">
          {{ new Date(data.createdAt).toLocaleDateString() }}
        </template>
      </Column>
      <Column header="Akcje">
        <template #body="{ data }">
          <Button
            icon="pi pi-external-link"
            severity="info"
            text
            rounded
            v-tooltip.top="'Przejdź do tematu'"
            @click="goToTopic(data._id)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToastHelper } from "../../composables/useToastHelper";
import { useAdminStore } from "../../stores/admin";
import { useTopicsStore } from "../../stores/topics";

const router = useRouter();
const { showSuccess, showError } = useToastHelper();
const adminStore = useAdminStore();
const topicsStore = useTopicsStore();

onMounted(() => {
  adminStore.fetchAdminTopics();
});

const handleToggleStatus = async (topic) => {
  try {
    if (topic.isClosed) {
      await topicsStore.openTopic(topic._id);
      topic.isClosed = false;
    } else {
      await topicsStore.closeTopic(topic._id);
      topic.isClosed = true;
    }

    showSuccess("Status tematu zmieniony");
  } catch (err) {
    showError(err);
  }
};

const goToTopic = (topicId) => {
  router.push({
    path: `/topic/${topicId}`,
    query: { returnTo: "admin" },
  });
};
</script>

<style scoped>
.clickable-tag {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable-tag:hover {
  opacity: 0.8;
}
</style>
