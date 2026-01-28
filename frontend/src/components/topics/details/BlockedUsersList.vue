<template>
  <div>
    <h4>Zablokowani użytkownicy</h4>
    <div v-if="topic.blockedUsers && topic.blockedUsers.length > 0">
      <div v-for="blocked in topic.blockedUsers" :key="blocked.user._id">
        <div>
          <div>
            <div>
              <i class="pi pi-ban"></i>
              <span>{{ blocked.user.username }}</span>
            </div>
            <small v-if="blocked.reason">{{ blocked.reason }}</small>
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
    <p v-else>Brak zablokowanych użytkowników</p>

    <Button
      label="Zablokuj użytkownika"
      icon="pi pi-ban"
      severity="danger"
      size="small"
      outlined
      @click="showBlockDialog = true"
    />

    <BlockUserDialog v-model:visible="showBlockDialog" :topic-id="topic._id" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useTopicsStore } from "../../../stores/topics";
import BlockUserDialog from "./BlockUserDialog.vue";

const props = defineProps({
  topic: { type: Object, required: true },
});

const toast = useToast();
const topicsStore = useTopicsStore();

const showBlockDialog = ref(false);

const handleUnblock = async (userId) => {
  try {
    await topicsStore.unblockUser(props.topic._id, userId);
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: "Użytkownik został odblokowany",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się odblokować użytkownika",
      life: 3000,
    });
  }
};
</script>

<style scoped></style>
