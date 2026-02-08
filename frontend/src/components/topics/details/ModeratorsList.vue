<template>
  <div>
    <h4>Moderatorzy</h4>

    <div
      v-if="topic.moderators && topic.moderators.length > 0"
      class="moderators-list"
    >
      <div
        v-for="mod in topic.moderators"
        :key="mod._id"
        class="moderator-item"
      >
        <div class="moderator-info">
          <Avatar
            :label="mod.user?.username?.charAt(0).toUpperCase() || 'U'"
            shape="circle"
            size="small"
            style="background-color: #ece9fc; color: #2a1261"
          />

          <div class="flex flex-column ml-2">
            <span class="font-bold">{{
              mod.user?.username || "Nieznany"
            }}</span>
            <small class="text-secondary" style="font-size: 0.75rem">
              Dodany: {{ new Date(mod.promotedAt).toLocaleDateString() }}
            </small>
          </div>

          <span v-if="isTopicCreator(getId(mod.user))" class="creator-badge">
            (Twórca)
          </span>
        </div>

        <Button
          v-if="canRemoveModerator(getId(mod.user), mod)"
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          v-tooltip="'Usuń uprawnienia'"
          @click="handleRemoveModerator(getId(mod.user))"
        />
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Brak dodatkowych moderatorów.</p>
    </div>

    <div class="mt-3">
      <Button
        label="Mianuj moderatora"
        icon="pi pi-user-plus"
        severity="secondary"
        outlined
        size="small"
        fluid
        @click="showPromoteDialog = true"
      />
    </div>

    <PromoteUserDialog
      v-model:visible="showPromoteDialog"
      :topic-id="topic._id"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToastHelper } from "../../../composables/useToastHelper";
import { useTopicsStore } from "../../../stores/topics";
import { useAuthStore } from "../../../stores/auth";
import PromoteUserDialog from "./PromoteUserDialog.vue";

const props = defineProps({
  topic: { type: Object, required: true },
});

const { showError } = useToastHelper();
const topicsStore = useTopicsStore();
const authStore = useAuthStore();

const showPromoteDialog = ref(false);

const isAdmin = computed(() => authStore.user?.role === "admin");
const currentUserId = computed(() => authStore.user?._id || authStore.user?.id);

const getId = (field) => (typeof field === "object" ? field?._id : field);

const isTopicCreator = (userId) => {
  return getId(props.topic.creator) === userId;
};

const isCurrentUserCreator = computed(() => {
  return isTopicCreator(currentUserId.value);
});

const canRemoveModerator = (targetUserId, moderatorObject) => {
  if (isTopicCreator(targetUserId)) return false;

  if (targetUserId === currentUserId.value) return false;

  if (isAdmin.value) return true;

  if (isCurrentUserCreator.value) return true;

  const promotedById = getId(moderatorObject.promotedBy);
  if (promotedById === currentUserId.value) {
    return true;
  }

  return false;
};

const handleRemoveModerator = async (userId) => {
  try {
    await topicsStore.revokeModerator(props.topic._id, userId);
  } catch (error) {
    showError(error || "Operacja nieudana");
  }
};
</script>

<style scoped>
.moderators-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.moderator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #eef0f2;
  transition: background-color 0.2s;
}

.moderator-item:hover {
  background-color: #f8fafc;
}

.moderator-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.creator-badge {
  font-size: 0.75rem;
  color: var(--p-primary-color);
  font-weight: 600;
  background: var(--p-primary-50);
  padding: 2px 6px;
  border-radius: 4px;
}

.empty-state {
  color: #94a3b8;
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 1rem;
}
</style>
