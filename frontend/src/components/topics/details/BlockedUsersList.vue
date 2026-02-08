<template>
  <div>
    <h4>Zablokowani użytkownicy</h4>

    <div v-if="moderatorStore.blockedUsers.directBlocks.length > 0">
      <h5 class="block-section-title">Zablokowani w tym temacie</h5>
      <div
        v-for="blocked in moderatorStore.blockedUsers.directBlocks"
        :key="blocked.user._id"
      >
        <div class="blocked-user-info">
          <div class="user-info">
            <Avatar
              :label="blocked.user.username.charAt(0).toUpperCase()"
              shape="circle"
              size="small"
            />
            <div>
              <div class="username">{{ blocked.user.username }}</div>
              <div class="user-id">ID: {{ blocked.user._id }}</div>
              <div v-if="blocked.reason" class="reason-text">
                Powód: {{ blocked.reason }}
              </div>
              <div
                v-if="
                  blocked.allowedSubtopics &&
                  blocked.allowedSubtopics.length > 0
                "
                class="allowed-subtopics"
              >
                <small>
                  Dozwolone podtematy:
                  {{ blocked.allowedSubtopics.map((s) => s.name).join(", ") }}
                </small>
              </div>
            </div>
          </div>
          <Button
            icon="pi pi-unlock"
            severity="secondary"
            text
            size="small"
            @click="handleUnblock(blocked.user._id)"
          />
        </div>
      </div>
    </div>

    <div
      v-if="moderatorStore.blockedUsers.inheritedBlocks.length > 0"
      class="inherited-section"
    >
      <h5 class="block-section-title">
        Zablokowani w tematach nadrzędnych (dziedziczone)
      </h5>
      <div
        v-for="blocked in moderatorStore.blockedUsers.inheritedBlocks"
        :key="blocked.user._id"
      >
        <div class="blocked-user-info inherited">
          <div class="user-info">
            <Avatar
              :label="blocked.user.username.charAt(0).toUpperCase()"
              shape="circle"
              size="small"
            />
            <div>
              <div class="username">{{ blocked.user.username }}</div>
              <div class="user-id">ID: {{ blocked.user._id }}</div>
              <div class="inherited-info">
                <Tag severity="info" size="small">
                  Zablokowany w: {{ blocked.blockedInTopic }}
                </Tag>
              </div>
              <div v-if="blocked.reason" class="reason-text">
                Powód: {{ blocked.reason }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p
      v-if="
        moderatorStore.blockedUsers.directBlocks.length === 0 &&
        moderatorStore.blockedUsers.inheritedBlocks.length === 0
      "
    >
      Brak zablokowanych użytkowników
    </p>

    <Button
      label="Zablokuj użytkownika"
      icon="pi pi-ban"
      severity="danger"
      size="small"
      outlined
      class="mt-3"
      @click="showBlockDialog = true"
    />

    <BlockUserDialog v-model:visible="showBlockDialog" :topic-id="topic._id" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToastHelper } from "../../../composables/useToastHelper";
import BlockUserDialog from "./BlockUserDialog.vue";
import { useModeratorStore } from "../../../stores/moderator";
import { useTopicsStore } from "../../../stores/topics";

const { showSuccess, showError } = useToastHelper();
const moderatorStore = useModeratorStore();
const topicsStore = useTopicsStore();
const props = defineProps({
  topic: { type: Object, required: true },
});

const showBlockDialog = ref(false);

const handleUnblock = async (userId) => {
  try {
    await topicsStore.unblockUser(props.topic._id, userId);
    await moderatorStore.fetchBlockedUsers(props.topic._id);
    showSuccess("Użytkownik został odblokowany");
  } catch (error) {
    showError(error || "Nie udało się odblokować użytkownika");
  }
};

onMounted(async () => {
  try {
    await moderatorStore.fetchBlockedUsers(props.topic._id);
  } catch (error) {
    console.error("Błąd pobierania zablokowanych użytkowników:", error);
  }
});
</script>

<style scoped>
.block-section-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: #334155;
}

.blocked-user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #f8fafc;
  margin-bottom: 0.5rem;
}

.blocked-user-info.inherited {
  background: #f1f5f9;
  border-left: 3px solid #3b82f6;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.username {
  font-weight: 600;
  color: #1e293b;
}

.user-id {
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: monospace;
  margin-top: 0.15rem;
}

.reason-text {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.inherited-info {
  margin-top: 0.25rem;
}

.allowed-subtopics {
  margin-top: 0.25rem;
  color: #059669;
  font-size: 0.85rem;
}

.inherited-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
