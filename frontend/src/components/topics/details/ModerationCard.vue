<template>
  <div class="surface-card p-3 border-round shadow-1 border-1 surface-border">
    <div
      class="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 surface-border"
    >
      <i class="pi pi-shield text-primary text-xl"></i>
      <span class="font-bold text-lg text-900">Panel Moderacji</span>
    </div>

    <div class="flex flex-column gap-4">
      <ModeratorsList :topic="topic" />

      <BlockedUsersList :topic="topic" />

      <TopicActionsButtons :topic="topic" />
    </div>

    <div class="mt-4 pt-3 border-top-1 surface-border">
      <ModeratorApplicationsCard :topicId="topic._id" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  topic: { type: Object, required: true },
});
</script>
