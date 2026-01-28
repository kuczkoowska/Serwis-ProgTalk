<template>
  <Dialog
    v-model:visible="isVisible"
    header="Edytuj opis tematu"
    :style="{ width: '500px' }"
    modal
  >
    <div>
      <p>Zmień opis tematu:</p>

      <div class="field">
        <Textarea
          v-model="editedDescription"
          rows="6"
          fluid
          placeholder="Wprowadź opis tematu..."
        />
      </div>
    </div>

    <template #footer>
      <Button label="Anuluj" text @click="closeDialog" />
      <Button
        label="Zapisz"
        icon="pi pi-check"
        @click="handleUpdateDescription"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useTopicsStore } from "../../../stores/topics";

const props = defineProps({
  visible: { type: Boolean, default: false },
  topicId: { type: String, required: true },
  description: { type: String, default: "" },
});

const emit = defineEmits(["update:visible"]);

const toast = useToast();
const topicsStore = useTopicsStore();

const editedDescription = ref("");

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      editedDescription.value = props.description || "";
    }
  },
);

const handleUpdateDescription = async () => {
  try {
    await topicsStore.updateTopicMetadata(
      props.topicId,
      editedDescription.value,
    );
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: "Opis tematu został zaktualizowany",
      life: 3000,
    });
    closeDialog();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się zaktualizować opisu",
      life: 3000,
    });
  }
};

const closeDialog = () => {
  isVisible.value = false;
};
</script>

<style scoped></style>
