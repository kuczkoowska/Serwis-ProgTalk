<template>
  <Dialog
    v-model:visible="isVisible"
    header="Promuj użytkownika na moderatora"
    :style="{ width: '450px' }"
    modal
  >
    <div>
      <p>Wyszukaj użytkownika, którego chcesz promować:</p>

      <div class="field">
        <AutoComplete
          v-model="selectedUser"
          :suggestions="searchResults"
          @complete="searchUsers"
          optionLabel="username"
          placeholder="Wpisz nazwę użytkownika..."
          fluid
          forceSelection
        >
          <template #option="slotProps">
            <div>
              <i class="pi pi-user"></i>
              <span>{{ slotProps.option.username }}</span>
              <small>({{ slotProps.option.email }})</small>
            </div>
          </template>
        </AutoComplete>
      </div>
    </div>

    <template #footer>
      <Button label="Anuluj" text @click="closeDialog" />
      <Button
        label="Promuj"
        icon="pi pi-check"
        :disabled="!selectedUser"
        @click="handlePromote"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useTopicsStore } from "../../../stores/topics";
import axios from "axios";

const props = defineProps({
  visible: { type: Boolean, default: false },
  topicId: { type: String, required: true },
});

const emit = defineEmits(["update:visible"]);

const toast = useToast();
const topicsStore = useTopicsStore();

const selectedUser = ref(null);
const searchResults = ref([]);

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const searchUsers = async (event) => {
  try {
    const response = await axios.get("/api/users/search", {
      params: { query: event.query },
    });
    searchResults.value = response.data.data.users;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: "Nie udało się wyszukać użytkowników",
      life: 3000,
    });
  }
};

const handlePromote = async () => {
  if (!selectedUser.value) return;

  try {
    await topicsStore.promoteModerator(props.topicId, selectedUser.value._id);
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: `${selectedUser.value.username} został promowany na moderatora`,
      life: 3000,
    });
    closeDialog();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się promować użytkownika",
      life: 3000,
    });
  }
};

const closeDialog = () => {
  isVisible.value = false;
  selectedUser.value = null;
};
</script>

<style scoped></style>
