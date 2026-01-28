<template>
  <div class="custom-card" v-if="canManage">
    <div class="sidebar-header">
      <i class="pi pi-shield"></i>
      <span>Panel moderacji</span>
    </div>
    <div class="sidebar-content">
      <ModeratorsList :topic="topic" />

      <Divider />

      <BlockedUsersList :topic="topic" />

      <Divider />

      <TopicActionsButtons :topic="topic" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTopicsStore } from "../../../stores/topics";

defineProps({
  topic: { type: Object, required: true },
});

const topicsStore = useTopicsStore();
const canManage = computed(() => topicsStore.canManage);
</script>

<style scoped></style>
