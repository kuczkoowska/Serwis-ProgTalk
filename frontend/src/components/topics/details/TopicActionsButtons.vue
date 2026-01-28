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
import { useToast } from "primevue/usetoast";
import { useTopicsStore } from "../../../stores/topics";
import { useAuthStore } from "../../../stores/auth";
import EditDescriptionDialog from "./EditDescriptionDialog.vue";

const props = defineProps({
  topic: { type: Object, required: true },
});

const toast = useToast();
const topicsStore = useTopicsStore();
const authStore = useAuthStore();

const showEditDescriptionDialog = ref(false);

const isAdmin = computed(() => authStore.user?.role === "admin");

const handleToggleClosed = async () => {
  try {
    await topicsStore.toggleTopicClosed(props.topic._id);
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: props.topic.isClosed
        ? "Temat został otwarty"
        : "Temat został zamknięty",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się zmienić statusu tematu",
      life: 3000,
    });
  }
};

const handleToggleHidden = async () => {
  try {
    await topicsStore.toggleTopicHidden(props.topic._id);
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: props.topic.isHidden
        ? "Temat został odkryty"
        : "Temat został ukryty",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się zmienić widoczności tematu",
      life: 3000,
    });
  }
};
</script>

<style scoped></style>
