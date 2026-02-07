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
import { useToastHelper } from "../../../composables/useToastHelper";
import { useTopicsStore } from "../../../stores/topics";
import api from "../../../plugins/axios.js";

const props = defineProps({
  visible: { type: Boolean, default: false },
  topicId: { type: String, required: true },
});

const emit = defineEmits(["update:visible"]);

const { showError } = useToastHelper();
const topicsStore = useTopicsStore();

const selectedUser = ref(null);
const searchResults = ref([]);

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const searchUsers = async (event) => {
  try {
    const response = await api.get("/users/search", {
      params: { query: event.query },
    });
    searchResults.value = response.data.data.users;
  } catch (error) {
    showError("Nie udało się wyszukać użytkowników", "Błąd");
  }
};

const handlePromote = async () => {
  if (!selectedUser.value) return;

  try {
    await topicsStore.promoteModerator(props.topicId, selectedUser.value._id);
    closeDialog();
  } catch (error) {
    showError(error || "Nie udało się promować użytkownika", "Błąd");
  }
};

const closeDialog = () => {
  isVisible.value = false;
  selectedUser.value = null;
};
</script>

<style scoped></style>
