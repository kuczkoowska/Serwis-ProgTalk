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

    <ModeratorApplicationsCard
      :topicId="topic._id"
      @moderator-added="refreshTopic"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTopicsStore } from "../../../stores/topics";
import ModeratorApplicationsCard from "./ModeratorApplicationsCard.vue";

const props = defineProps({
  topic: { type: Object, required: true },
});

const topicsStore = useTopicsStore();
const canManage = computed(() => topicsStore.canManage);

const refreshTopic = () => {
  topicsStore.fetchTopicDetails(props.topic._id);
};
</script>

<style scoped></style>
