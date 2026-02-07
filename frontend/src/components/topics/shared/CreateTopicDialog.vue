<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '32rem' }"
    :showHeader="false"
  >
    <div class="dialog-header">
      <h2>{{ parentId ? "Nowy Podtemat" : "Rozpocznij dyskusję" }}</h2>
      <p class="subtitle">
        {{
          parentId
            ? "Stwórz dział wewnątrz tego tematu."
            : "Stwórz nową przestrzeń dla społeczności."
        }}
      </p>
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

      <div class="field">
        <label for="tags">Tagi (opcjonalne)</label>
        <MultiSelect
          id="tags"
          v-model="form.selectedTags"
          :options="tagsStore.sortedTags"
          optionLabel="name"
          optionValue="_id"
          placeholder="Wybierz tagi"
          :maxSelectedLabels="3"
          selectAllLabel="Zaznacz wszystkie"
          fluid
          variant="filled"
          display="chip"
        />
        <small class="help-text">
          Wybierz tagi, aby ułatwić znalezienie tematu
        </small>
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
import { reactive, ref, computed, watch } from "vue";
import { useTopicsStore } from "../../../stores/topics";
import { useTagsStore } from "../../../stores/tags";
import { useToastHelper } from "../../../composables/useToastHelper";

const props = defineProps(["visible", "parentId"]);
const emit = defineEmits(["update:visible", "created"]);

const topicsStore = useTopicsStore();
const tagsStore = useTagsStore();
const { showSuccess, showError } = useToastHelper();

const isCreating = ref(false);
const submitted = ref(false);

const form = reactive({
  name: "",
  description: "",
  selectedTags: [],
});

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      await tagsStore.fetchTags();
    }
  },
);

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
      tags: form.selectedTags,
      parentId: props.parentId || null,
    });

    showSuccess("Temat utworzony!");

    form.name = "";
    form.description = "";
    form.selectedTags = [];
    submitted.value = false;
    isVisible.value = false;
    emit("created");
  } catch (e) {
    showError(e || "Błąd tworzenia");
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

.help-text {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 4px;
}
</style>
