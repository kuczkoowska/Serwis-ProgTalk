<template>
  <div
    class="surface-card p-3 border-round shadow-1 border-1 surface-border mt-3"
  >
    <div class="flex align-items-center justify-content-between mb-3">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-tags text-primary text-xl"></i>
        <span class="font-bold text-lg text-900">Tagi tematu</span>
      </div>
    </div>

    <div class="flex flex-column gap-3">
      <div v-if="tagsStore.loading" class="flex justify-content-center p-2">
        <ProgressSpinner style="width: 20px; height: 20px" />
      </div>

      <div
        v-else-if="tagsStore.topicTags.length === 0"
        class="text-center py-2 text-500 text-sm font-italic"
      >
        Brak przypisanych tagów.
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <div
          v-for="tag in tagsStore.topicTags"
          :key="tag._id"
          class="inline-flex align-items-center border-round px-2 py-1 gap-2"
          :style="{ backgroundColor: tag.color || '#64748b', color: '#fff' }"
        >
          <span class="text-sm font-medium">{{ tag.name }}</span>

          <i
            v-if="canManage"
            class="pi pi-times cursor-pointer hover:text-red-200 transition-colors"
            style="font-size: 0.8rem"
            @click="handleDelete(tag._id)"
            v-tooltip.top="'Usuń tag'"
          ></i>
        </div>
      </div>

      <Button
        v-if="canManage"
        label="Zarządzaj tagami"
        size="small"
        severity="secondary"
        outlined
        fluid
        icon="pi pi-plus"
        @click="showDialog = true"
      />
    </div>

    <TagDialog v-model:visible="showDialog" :topicId="topicId" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTagsStore } from "../../../../stores/tags";
import { useAuthStore } from "../../../../stores/auth";
import { useTopicsStore } from "../../../../stores/topics";
import { useToastHelper } from "../../../../composables/useToastHelper";

const props = defineProps({
  topicId: { type: String, required: true },
});

const tagsStore = useTagsStore();
const authStore = useAuthStore();
const topicsStore = useTopicsStore();
const { showSuccess, showError } = useToastHelper();

const showDialog = ref(false);

const canManage = computed(() => {
  if (!authStore.user) return false;
  if (authStore.user.role === "admin") return true;
  return topicsStore.canManage;
});

const handleDelete = async (tagId) => {
  if (!confirm("Czy na pewno chcesz odpiąć ten tag?")) return;

  try {
    await tagsStore.removeTagFromTopic(props.topicId, tagId);
    showSuccess("Tag odpięty");
  } catch (err) {
    showError(err);
  }
};

onMounted(() => {
  tagsStore.fetchTagsForTopic(props.topicId);
});
</script>
