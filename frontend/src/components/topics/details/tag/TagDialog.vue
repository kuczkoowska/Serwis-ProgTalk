<template>
  <Dialog
    :visible="visible"
    modal
    header="Dodaj tagi do tematu"
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-4">
      <div class="flex flex-column gap-2">
        <label class="font-bold text-700">Wyszukaj lub stwórz nowy tag</label>

        <AutoComplete
          v-model="searchValue"
          :suggestions="filteredTags"
          @complete="searchTags"
          placeholder="Wpisz nazwę tagu..."
          optionLabel="name"
          class="w-full"
          dropdown
          fluid
        >
          <template #option="{ option }">
            <div class="flex align-items-center gap-2">
              <span
                class="w-1rem h-1rem border-circle inline-block"
                :style="{ backgroundColor: option.color || '#ccc' }"
              ></span>
              <span>{{ option.name }}</span>
              <span class="text-500 text-xs ml-auto"
                >({{ option.usageCount || 0 }})</span
              >
            </div>
          </template>
        </AutoComplete>
      </div>

      <div class="flex justify-content-end gap-2">
        <Button
          label="Anuluj"
          text
          severity="secondary"
          @click="$emit('update:visible', false)"
        />

        <Button
          v-if="isExistingTag"
          label="Dodaj wybrany tag"
          icon="pi pi-check"
          @click="handleAddExistingTag"
          :loading="loading"
        />

        <Button
          v-else-if="isValidNewTag"
          :label="`Stwórz i dodaj '${searchValue}'`"
          icon="pi pi-plus"
          severity="success"
          @click="handleCreateAndAddTag"
          :loading="loading"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useTagsStore } from "../../../../stores/tags";
import { useToastHelper } from "../../../../composables/useToastHelper";

const props = defineProps({
  visible: { type: Boolean, required: true },
  topicId: { type: String, required: true },
});

const emit = defineEmits(["update:visible", "updated"]);

const tagsStore = useTagsStore();
const { showSuccess, showError, showWarning } = useToastHelper();

const searchValue = ref("");
const filteredTags = ref([]);
const loading = ref(false);

onMounted(() => {
  tagsStore.fetchTags();
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      tagsStore.fetchTags();
      searchValue.value = "";
    }
  },
);

const searchTags = (event) => {
  const query = event.query.toLowerCase();
  filteredTags.value = tagsStore.allTags.filter((tag) =>
    tag.name.toLowerCase().includes(query),
  );
};

const isExistingTag = computed(() => {
  return (
    searchValue.value &&
    typeof searchValue.value === "object" &&
    searchValue.value._id
  );
});

const isValidNewTag = computed(() => {
  return (
    searchValue.value &&
    typeof searchValue.value === "string" &&
    searchValue.value.trim().length > 0
  );
});

const handleAddExistingTag = async () => {
  if (!isExistingTag.value) return;

  const alreadyAdded = tagsStore.topicTags.some(
    (t) => t._id === searchValue.value._id,
  );
  if (alreadyAdded) {
    showWarning("Ten tag jest już przypisany do tematu.");
    return;
  }

  loading.value = true;
  try {
    await tagsStore.assignTagToTopic(props.topicId, searchValue.value._id);
    showSuccess("Tag dodany");
    emit("updated");
    emit("update:visible", false);
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

const handleCreateAndAddTag = async () => {
  if (!isValidNewTag.value) return;
  const tagName = searchValue.value.trim();

  const existing = tagsStore.allTags.find(
    (t) => t.name.toLowerCase() === tagName.toLowerCase(),
  );
  if (existing) {
    showWarning("Taki tag już istnieje. Wybierz go z listy.");
    searchValue.value = existing;
    return;
  }

  loading.value = true;
  try {
    const res = await tagsStore.createTag(tagName);
    const newTagId = res.data.tag._id;

    await tagsStore.assignTagToTopic(props.topicId, newTagId);

    showSuccess(`Tag "${tagName}" utworzony i dodany`);
    emit("updated");
    emit("update:visible", false);
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};
</script>
