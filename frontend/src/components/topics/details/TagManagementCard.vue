<template>
  <div class="custom-card mt-3">
    <div class="sidebar-header">
      <i class="pi pi-tags text-primary"></i>
      <span>Tagi tematu</span>
    </div>

    <div class="sidebar-content">
      <div v-if="tagsStore.loading" class="loading-state">
        <ProgressSpinner />
      </div>

      <div v-else-if="tagsStore.tags.length === 0" class="empty-tags">
        <p>Brak tagów dla tego tematu</p>
      </div>

      <div v-else class="tags-list">
        <ul class="subtopics-list">
          <li v-for="tag in tagsStore.tags" :key="tag._id" class="tag-item">
            <span class="tag-badge" :style="{ background: tag.color }">
              {{ tag.name }}
            </span>
            <Button
              v-if="canManage"
              icon="pi pi-times"
              rounded
              text
              size="small"
              severity="danger"
              @click="handleDelete(tag._id)"
            />
          </li>
        </ul>
      </div>

      <Button
        v-if="canManage"
        label="Utwórz tag"
        size="small"
        severity="secondary"
        outlined
        fluid
        icon="pi pi-plus"
        @click="showDialog = true"
      />
    </div>

    <TagDialog
      v-model:visible="showDialog"
      :topicId="topicId"
      @created="refreshTags"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useTagsStore } from "../../../stores/tags.js";
import { useAuthStore } from "../../../stores/auth.js";
import { useTopicsStore } from "../../../stores/topics.js";
import TagDialog from "./TagDialog.vue";

const props = defineProps({
  topicId: { type: String, required: true },
  moderators: { type: Array, default: () => [] },
});

const tagsStore = useTagsStore();
const authStore = useAuthStore();
const topicsStore = useTopicsStore();
const toast = useToast();

const showDialog = ref(false);

const canManage = computed(() => {
  if (!authStore.user) return false;
  if (authStore.user.role === "admin") return true;

  return topicsStore.canManageTopic(authStore.user.id);
});

const refreshTags = async () => {
  await tagsStore.fetchTagsForTopic(props.topicId);
};

const handleDelete = async (tagId) => {
  try {
    await tagsStore.deleteTag(tagId, props.topicId);
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: "Tag został usunięty",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: err || "Nie udało się usunąć tagu",
      life: 3000,
    });
  }
};
</script>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.empty-tags {
  text-align: center;
  padding: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}

.tags-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.subtopics-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-radius: 6px;
  color: #334155;
  font-weight: 500;
}

.subtopics-list li:hover {
  background-color: #f8f1f9;
}

.tag-badge {
  padding: 0.4rem 0.9rem;
  border-radius: 16px;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
