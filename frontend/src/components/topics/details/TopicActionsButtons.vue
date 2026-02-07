<template>
  <div>
    <Button
      label="Edytuj opis tematu"
      icon="pi pi-pencil"
      severity="info"
      size="small"
      outlined
      fluid
      @click="showEditDescriptionDialog = true"
    />

    <Button
      :label="topic.isClosed ? 'Otwórz temat' : 'Zamknij temat'"
      :icon="topic.isClosed ? 'pi pi-lock-open' : 'pi pi-lock'"
      :severity="topic.isClosed ? 'success' : 'warning'"
      size="small"
      outlined
      fluid
      @click="handleToggleClosed"
    />

    <Button
      v-if="isAdmin"
      :label="topic.isHidden ? 'Odkryj temat' : 'Ukryj temat'"
      :icon="topic.isHidden ? 'pi pi-eye' : 'pi pi-eye-slash'"
      severity="danger"
      size="small"
      outlined
      fluid
      @click="handleToggleHidden"
    />

    <EditDescriptionDialog
      v-model:visible="showEditDescriptionDialog"
      :topic-id="topic._id"
      :description="topic.description"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToastHelper } from "../../../composables/useToastHelper";
import { useTopicsStore } from "../../../stores/topics";
import { useAuthStore } from "../../../stores/auth";
import EditDescriptionDialog from "./EditDescriptionDialog.vue";

const props = defineProps({
  topic: { type: Object, required: true },
});

const { showSuccess, showError } = useToastHelper();
const topicsStore = useTopicsStore();
const authStore = useAuthStore();

const showEditDescriptionDialog = ref(false);

const isAdmin = computed(() => authStore.user?.role === "admin");

const handleToggleClosed = async () => {
  try {
    await topicsStore.toggleTopicClosed(props.topic._id);
    showSuccess(
      props.topic.isClosed ? "Temat został otwarty" : "Temat został zamknięty",
      "Sukces",
    );
  } catch (error) {
    showError(error || "Nie udało się zmienić statusu tematu", "Błąd");
  }
};

const handleToggleHidden = async () => {
  try {
    await topicsStore.toggleTopicHidden(props.topic._id);
    showSuccess(
      props.topic.isHidden ? "Temat został odkryty" : "Temat został ukryty",
      "Sukces",
    );
  } catch (error) {
    showError(error || "Nie udało się zmienić widoczności tematu", "Błąd");
  }
};
</script>

<style scoped></style>
