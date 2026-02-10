<template>
  <div class="surface-card p-3 border-round shadow-1 border-1 surface-border">
    <div class="flex align-items-center justify-content-between mb-3">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-tags text-primary text-xl"></i>
        <span class="font-bold text-lg text-900">Tagi</span>
      </div>
      <Button
        v-if="canManage"
        icon="pi pi-cog"
        rounded
        text
        size="small"
        v-tooltip="'Zarządzaj tagami'"
        @click="showDialog = true"
      />
    </div>

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
      <span
        v-for="tag in tagsStore.topicTags"
        :key="tag._id"
        class="px-2 py-1 border-round text-sm font-medium text-white"
        :style="{ backgroundColor: tag.color || '#64748b' }"
      >
        #{{ tag.name }}
      </span>
    </div>

    <TagDialog
      v-model:visible="showDialog"
      :topicId="topicId"
      :currentTags="tagsStore.topicTags"
      @updated="refreshTags"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTagsStore } from "../../../stores/tags";
import { useAuthStore } from "../../../stores/auth";
import { useTopicsStore } from "../../../stores/topics";
import TagDialog from "./TagDialog.vue";

const props = defineProps({
  topicId: { type: String, required: true },
});

const tagsStore = useTagsStore();
const authStore = useAuthStore();
const topicsStore = useTopicsStore();
const showDialog = ref(false);

const canManage = computed(() => {
  return authStore.user?.role === "admin" || topicsStore.canManage;
});

const refreshTags = () => {
  tagsStore.fetchTagsForTopic(props.topicId);
};

onMounted(() => refreshTags());
watch(
  () => props.topicId,
  () => refreshTags(),
);
</script>
