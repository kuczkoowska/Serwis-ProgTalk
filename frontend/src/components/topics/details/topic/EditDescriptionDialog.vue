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
import { useToastHelper } from "../../../../composables/useToastHelper";
import { useTopicsStore } from "../../../../stores/topics";

const props = defineProps({
  visible: { type: Boolean, default: false },
  topicId: { type: String, required: true },
  description: { type: String, default: "" },
});

const emit = defineEmits(["update:visible"]);

const { showSuccess, showError } = useToastHelper();
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
    showSuccess("Opis tematu został zaktualizowany", "Sukces");
    closeDialog();
  } catch (error) {
    showError(error || "Nie udało się zaktualizować opisu", "Błąd");
  }
};

const closeDialog = () => {
  isVisible.value = false;
};
</script>

<style scoped></style>
