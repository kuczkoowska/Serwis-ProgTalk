<template>
  <Dialog
    :visible="visible"
    modal
    header="Zarządzaj tagami"
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="dialog-content">
      <div class="input-group">
        <label class="font-bold mb-2">Wyszukaj tag lub stwórz nowy</label>
        <Divider />
        <AutoComplete
          v-model="searchValue"
          :suggestions="filteredTags"
          @complete="searchTags"
          placeholder="Zacznij pisać nazwę tagu..."
          optionLabel="name"
          class="tag-autocomplete"
          dropdown
          fluid
        >
          <template #option="slotProps">
            <div class="tag-option">
              <TagBadge :tag="slotProps.option" />
              <span class="usage-count"
                >({{ slotProps.option.usageCount || 0 }} użyć)</span
              >
            </div>
          </template>
        </AutoComplete>

        <div class="action-buttons mt-3 flex gap-2">
          <Button
            v-if="isExistingTag"
            label="Dodaj ten tag"
            icon="pi pi-plus"
            @click="handleAddExistingTag"
            :loading="loading"
          />

          <Button
            v-else-if="
              searchValue &&
              typeof searchValue === 'string' &&
              searchValue.trim().length > 0
            "
            :label="`Stwórz i dodaj '${searchValue}'`"
            icon="pi pi-plus-circle"
            severity="success"
            @click="handleCreateAndAddTag"
            :loading="loading"
          />
        </div>

        <small
          v-if="
            searchValue && typeof searchValue === 'string' && !isExistingTag
          "
          class="text-gray-500 mt-1"
        >
          Tag "{{ searchValue }}" nie istnieje - kliknij aby go utworzyć.
        </small>
      </div>

      <Divider />

      <div class="current-tags">
        <label class="font-bold block mb-2">Obecne tagi tematu:</label>

        <div v-if="currentTags.length > 0" class="tags-list">
          <div v-for="tag in currentTags" :key="tag._id" class="tag-item">
            <TagBadge :tag="tag" />
            <Button
              icon="pi pi-times"
              rounded
              text
              size="small"
              severity="danger"
              @click="handleRemoveTag(tag._id)"
              class="remove-btn"
            />
          </div>
        </div>
        <p v-else class="text-gray-500 italic text-sm">
          Brak przypisanych tagów.
        </p>
      </div>
    </div>

    <template #footer>
      <Button label="Gotowe" @click="$emit('update:visible', false)" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useToastHelper } from "../../../composables/useToastHelper";
import { useTagsStore } from "../../../stores/tags";
import TagBadge from "../../shared/TagBadge.vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  topicId: { type: String, required: true },
  currentTags: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:visible", "updated"]);

const tagsStore = useTagsStore();
const { showSuccess, showError, showWarning } = useToastHelper();

const loading = ref(false);
const searchValue = ref(null);
const filteredTags = ref([]);

const isExistingTag = computed(() => {
  return searchValue.value && typeof searchValue.value === "object";
});

const availableTags = computed(() => {
  const currentTagIds = props.currentTags.map((t) => t._id);
  return tagsStore.allTags.filter((tag) => !currentTagIds.includes(tag._id));
});

const searchTags = (event) => {
  const query = event.query.toLowerCase();

  if (!query) {
    filteredTags.value = availableTags.value;
  } else {
    filteredTags.value = availableTags.value.filter((tag) =>
      tag.name.toLowerCase().includes(query),
    );
  }
};

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      await tagsStore.fetchTags();
      searchValue.value = null;
      filteredTags.value = [];
    }
  },
);

const handleAddExistingTag = async () => {
  if (!isExistingTag.value) return;

  loading.value = true;
  try {
    await tagsStore.assignTagToTopic(props.topicId, searchValue.value._id);

    showSuccess("Tag dodany");
    searchValue.value = null;
    emit("updated");
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

const handleCreateAndAddTag = async () => {
  if (!searchValue.value || typeof searchValue.value !== "string") return;

  const tagName = searchValue.value.trim();
  if (!tagName) {
    showWarning("Nazwa tagu jest pusta");
    return;
  }

  loading.value = true;
  try {
    const res = await tagsStore.createTag(tagName);
    const newTagId = res.data.tag._id;

    await tagsStore.assignTagToTopic(props.topicId, newTagId);

    showSuccess(`Tag "${tagName}" utworzony i dodany`);
    searchValue.value = null;
    emit("updated");
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

const handleRemoveTag = async (tagId) => {
  try {
    await tagsStore.removeTagFromTopic(props.topicId, tagId);
    showSuccess("Tag usunięty");
    emit("updated");
  } catch (err) {
    showError(err);
  }
};
</script>

<style scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .tag-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0;
  }

  .usage-count {
    font-size: 0.85rem;
    color: #64748b;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 20px;
    background: #f8fafc;
    transition: background 0.2s;
  }

  .tag-item:hover {
    background: #f1f5f9;
  }

  .remove-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}
</style>
