<template>
  <div>
    <h4>Moderatorzy</h4>
    <div v-if="topic.moderators && topic.moderators.length > 0">
      <div v-for="mod in topic.moderators" :key="mod.user._id">
        <div>
          <div>
            <i class="pi pi-user"></i>
            <span>{{ mod.user.username }}</span>
            <span v-if="isTopicCreator(mod.user._id)">(Twórca)</span>
          </div>
          <Button
            v-if="canRemoveModerator(mod.user._id)"
            icon="pi pi-times"
            severity="danger"
            text
            size="small"
            @click="handleRemoveModerator(mod.user._id)"
          />
        </div>
      </div>
    </div>
    <p v-else>Brak dodatkowych moderatorów</p>

    <Button
      label="Promuj użytkownika"
      icon="pi pi-user-plus"
      severity="secondary"
      size="small"
      @click="showPromoteDialog = true"
    />

    <PromoteUserDialog
      v-model:visible="showPromoteDialog"
      :topic-id="topic._id"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useTopicsStore } from "../../../stores/topics";
import { useAuthStore } from "../../../stores/auth";

const props = defineProps({
  topic: { type: Object, required: true },
});

const toast = useToast();
const topicsStore = useTopicsStore();
const authStore = useAuthStore();

const showPromoteDialog = ref(false);

const isAdmin = computed(() => authStore.user?.role === "admin");

const isTopicCreator = (userId) => {
  return props.topic.creator._id === userId || props.topic.creator === userId;
};

const canRemoveModerator = (userId) => {
  if (isTopicCreator(userId)) return false;
  if (isAdmin.value) return true;
  if (isTopicCreator(authStore.user?._id)) return true;
  return false;
};

const handleRemoveModerator = async (userId) => {
  try {
    await topicsStore.revokeModerator(props.topic._id, userId);
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: "Uprawnienia moderatora zostały cofnięte",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się usunąć moderatora",
      life: 3000,
    });
  }
};
</script>

<style scoped></style>
