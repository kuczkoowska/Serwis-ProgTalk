<template>
  <div>
    <h4 class="text-sm font-bold text-700 m-0 mb-2 uppercase">
      Zablokowani użytkownicy
    </h4>

    <div v-if="moderatorStore.loading" class="flex justify-content-center p-2">
      <ProgressSpinner style="width: 20px; height: 20px" />
    </div>

    <div v-else>
      <div v-if="directBlocks.length > 0" class="flex flex-column gap-2">
        <div
          v-for="blocked in directBlocks"
          :key="blocked.user._id"
          class="flex align-items-center justify-content-between p-2 bg-gray-50 border-round"
        >
          <div class="flex align-items-center gap-2">
            <Avatar
              :label="blocked.user.username[0].toUpperCase()"
              shape="circle"
              size="small"
              class="bg-red-100 text-red-700"
            />
            <div>
              <div class="font-bold text-sm">{{ blocked.user.username }}</div>
              <div v-if="blocked.reason" class="text-xs text-500">
                {{ blocked.reason }}
              </div>
            </div>
          </div>
          <Button
            icon="pi pi-unlock"
            text
            rounded
            severity="secondary"
            size="small"
            @click="handleUnblock(blocked.user._id)"
            v-tooltip="'Odblokuj'"
          />
        </div>
      </div>

      <div v-if="inheritedBlocks.length > 0" class="mt-2">
        <div class="text-xs text-500 mb-1 font-italic">
          Dziedziczone z nadrzędnych:
        </div>
        <div
          v-for="blocked in inheritedBlocks"
          :key="blocked.user._id"
          class="flex align-items-center gap-2 p-2 bg-gray-50 border-round opacity-70"
        >
          <Avatar
            :label="blocked.user.username[0]"
            shape="circle"
            size="small"
          />
          <div class="flex-1">
            <div class="text-sm">{{ blocked.user.username }}</div>
            <div class="text-xs text-blue-500">
              z: {{ blocked.blockedInTopic }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="directBlocks.length === 0 && inheritedBlocks.length === 0"
        class="text-sm text-500 font-italic"
      >
        Brak zablokowanych użytkowników.
      </div>
    </div>

    <Button
      label="Zablokuj użytkownika"
      icon="pi pi-ban"
      severity="danger"
      size="small"
      outlined
      fluid
      class="mt-3"
      @click="showBlockDialog = true"
    />

    <BlockUserDialog v-model:visible="showBlockDialog" :topic-id="topic._id" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useToastHelper } from "../../../composables/useToastHelper";
import BlockUserDialog from "./BlockUserDialog.vue";
import { useModeratorStore } from "../../../stores/moderator";
import { useTopicsStore } from "../../../stores/topics";

const props = defineProps({
  topic: { type: Object, required: true },
});

const { showSuccess, showError } = useToastHelper();
const moderatorStore = useModeratorStore();
const topicsStore = useTopicsStore();
const showBlockDialog = ref(false);

const directBlocks = computed(() => moderatorStore.blockedUsers.directBlocks);
const inheritedBlocks = computed(
  () => moderatorStore.blockedUsers.inheritedBlocks,
);

const handleUnblock = async (userId) => {
  try {
    await topicsStore.unblockUser(props.topic._id, userId);
    await moderatorStore.fetchBlockedUsers(props.topic._id);
    showSuccess("Użytkownik odblokowany");
  } catch (error) {
    showError(error);
  }
};

onMounted(() => {
  moderatorStore.fetchBlockedUsers(props.topic._id);
  moderatorStore.initModeratorSockets(props.topic._id);
});
</script>
