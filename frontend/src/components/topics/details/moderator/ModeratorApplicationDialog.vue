<template>
  <Dialog
    v-model:visible="visible"
    header="Zgłoś chęć zostania moderatorem"
    :style="{ width: '500px' }"
    modal
    @hide="resetForm"
  >
    <div class="application-form">
      <div class="field mb-3">
        <label for="motivation" class="font-bold block mb-2"
          >Dlaczego chcesz zostać moderatorem? *</label
        >
        <Textarea
          id="motivation"
          v-model="form.motivation"
          rows="4"
          placeholder="Opisz swoją motywację..."
          class="w-full"
          autoResize
        />
      </div>

      <div class="field mb-3">
        <label for="experience" class="font-bold block mb-2"
          >Doświadczenie (opcjonalne)</label
        >
        <Textarea
          id="experience"
          v-model="form.experience"
          rows="3"
          placeholder="Opisz swoje doświadczenie..."
          class="w-full"
          autoResize
        />
      </div>

      <div class="field mb-3">
        <label for="availability" class="font-bold block mb-2"
          >Dostępność</label
        >
        <Select
          id="availability"
          v-model="form.availability"
          :options="availabilityOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Wybierz poziom dostępności"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Anuluj" icon="pi pi-times" text @click="closeDialog" />
      <Button
        label="Wyślij zgłoszenie"
        icon="pi pi-send"
        :loading="sending"
        :disabled="!form.motivation.trim()"
        @click="submitApplication"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToastHelper } from "../../../../composables/useToastHelper";
import { useApplicationsStore } from "../../../../stores/applications";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  topicId: { type: String, required: true },
});

const emit = defineEmits(["update:modelValue", "submitted"]);

const { showSuccess, showError } = useToastHelper();
const applicationsStore = useApplicationsStore();
const sending = ref(false);

const form = ref({
  motivation: "",
  experience: "",
  availability: "moderate",
});

const availabilityOptions = [
  { label: "Niska - kilka razy w tygodniu", value: "low" },
  { label: "Średnia - codziennie", value: "moderate" },
  { label: "Wysoka - kilka razy dziennie", value: "high" },
];

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const resetForm = () => {
  form.value = { motivation: "", experience: "", availability: "moderate" };
};

const closeDialog = () => {
  visible.value = false;
};

const submitApplication = async () => {
  if (!form.value.motivation.trim()) {
    showError("Motywacja jest wymagana");
    return;
  }

  sending.value = true;
  try {
    await applicationsStore.submitApplication(props.topicId, {
      motivation: form.value.motivation.trim(),
      experience: form.value.experience.trim(),
      availability: form.value.availability,
    });

    showSuccess("Zgłoszenie wysłane! Oczekuje na rozpatrzenie.");

    closeDialog();

    emit("submitted");
  } catch (error) {
    showError(error);
  } finally {
    sending.value = false;
  }
};
</script>
