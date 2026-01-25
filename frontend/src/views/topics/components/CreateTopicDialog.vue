<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '32rem' }"
    :showHeader="false"
  >
    <div class="dialog-header">
      <h2>Rozpocznij dyskusję</h2>
      <p class="subtitle">Stwórz nową przestrzeń dla społeczności.</p>
    </div>

    <div class="form-content">
      <div class="field">
        <label for="name">Nazwa tematu</label>
        <IconField>
          <InputIcon class="pi pi-hashtag" />
          <InputText
            id="name"
            v-model="form.name"
            placeholder="np. JavaScript, Python"
            :invalid="submitted && !form.name"
            fluid
            variant="filled"
          />
        </IconField>
        <small v-if="submitted && !form.name" class="p-error">
          <i class="pi pi-exclamation-circle"></i> Nazwa jest wymagana.
        </small>
      </div>

      <div class="field">
        <label for="desc">Krótki opis</label>
        <Textarea
          id="desc"
          v-model="form.description"
          rows="4"
          placeholder="O czym będziemy tu rozmawiać?"
          autoResize
          fluid
          variant="filled"
        />
        <small v-if="submitted && !form.description" class="p-error">
          <i class="pi pi-exclamation-circle"></i> Opis jest wymagany.
        </small>
        <div class="char-counter">
          {{ form.description.length }} / 200 znaków
        </div>
      </div>
    </div>

    <div class="dialog-footer">
      <Button
        label="Anuluj"
        text
        severity="secondary"
        @click="isVisible = false"
        class="w-full"
      />
      <Button
        label="Utwórz temat"
        icon="pi pi-arrow-right"
        iconPos="right"
        @click="handleCreate"
        :loading="isCreating"
        class="w-full"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useTopicsStore } from "../../../stores/topics";
import { useToast } from "primevue/usetoast";

const props = defineProps(["visible"]);
const emit = defineEmits(["update:visible", "created"]);

const topicsStore = useTopicsStore();
const toast = useToast();

const isCreating = ref(false);
const submitted = ref(false);

const form = reactive({
  name: "",
  description: "",
});

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const handleCreate = async () => {
  submitted.value = true;

  if (!form.name.trim() || !form.description.trim()) {
    return;
  }

  isCreating.value = true;
  try {
    await topicsStore.createTopic({
      name: form.name,
      description: form.description,
    });

    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: "Temat utworzony!",
      life: 3000,
    });

    form.name = "";
    form.description = "";
    submitted.value = false;
    isVisible.value = false;
    emit("created");
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: e || "Błąd tworzenia",
      life: 3000,
    });
  } finally {
    isCreating.value = false;
  }
};
</script>

<style scoped>
.dialog-header {
  text-align: center;
  padding: 2rem 0 1rem 0;
}

.subtitle {
  color: #64748b;
}

.field {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.char-counter {
  text-align: right;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1rem 0 1rem;
  margin-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.p-error {
  color: #ef4444;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}
</style>
