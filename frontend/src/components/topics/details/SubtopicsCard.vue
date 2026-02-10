<template>
  <div class="surface-card p-3 border-round shadow-1 border-1 surface-border">
    <div class="flex align-items-center justify-content-between mb-3">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-sitemap text-primary text-xl"></i>
        <span class="font-bold text-lg text-900">Podtematy</span>
      </div>
      <Button
        v-if="canCreate"
        icon="pi pi-plus"
        rounded
        text
        size="small"
        v-tooltip="'Utwórz podtemat'"
        @click="$emit('create')"
      />
    </div>

    <ul
      v-if="subtopics.length > 0"
      class="list-none p-0 m-0 flex flex-column gap-2"
    >
      <li
        v-for="sub in subtopics"
        :key="sub._id"
        class="p-2 border-round hover:surface-hover cursor-pointer transition-colors transition-duration-200 flex align-items-center justify-content-between"
        @click="$router.push(`/topic/${sub._id}`)"
      >
        <div class="flex align-items-center gap-2 overflow-hidden">
          <i class="pi pi-hashtag text-500"></i>
          <span
            class="font-medium text-700 white-space-nowrap overflow-hidden text-overflow-ellipsis"
          >
            {{ sub.name }}
          </span>
        </div>
        <i class="pi pi-angle-right text-400 text-sm"></i>
      </li>
    </ul>

    <div v-else class="text-center py-3 text-500 text-sm font-italic">
      Brak podtematów.
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../../stores/auth";
import { useTopicsStore } from "../../../stores/topics";

defineProps({
  subtopics: { type: Array, default: () => [] },
});

defineEmits(["create"]);

const authStore = useAuthStore();
const topicsStore = useTopicsStore();

const canCreate = computed(() => {
  return (
    authStore.user?.role === "admin" ||
    (topicsStore.canManage && !topicsStore.isBlocked)
  );
});
</script>
