<template>
  <Dialog
    v-model:visible="isVisible"
    header="Zablokuj użytkownika"
    :style="{ width: '500px' }"
    modal
  >
    <div class="block-dialog-content">
      <p class="mb-3">Wyszukaj użytkownika, którego chcesz zablokować:</p>

      <div class="field">
        <AutoComplete
          v-model="userToBlock"
          :suggestions="searchResults"
          @complete="searchUsers"
          optionLabel="username"
          placeholder="Wpisz nazwę użytkownika..."
          fluid
          forceSelection
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-user"></i>
              <span>{{ slotProps.option.username }}</span>
              <small class="text-muted">({{ slotProps.option.email }})</small>
            </div>
          </template>
        </AutoComplete>
      </div>

      <div class="field">
        <label for="blockReason">Powód blokady:</label>
        <Textarea
          id="blockReason"
          v-model="blockReason"
          rows="3"
          class="w-full"
          placeholder="Np. spam, naruszenie regulaminu..."
        />
      </div>

      <div v-if="subtopics.length > 0" class="field">
        <label class="block mb-2">
          <i class="pi pi-info-circle mr-1"></i>
          Podtematy z zachowanym dostępem (opcjonalnie):
        </label>
        <small class="block mb-2 text-muted">
          Blokada obejmie ten temat i wszystkie podtematy. Zaznacz podtematy, do
          których użytkownik zachowa dostęp pomimo blokady.
        </small>
        <div class="subtopics-list">
          <div
            v-for="subtopic in subtopics"
            :key="subtopic._id"
            class="subtopic-item"
          >
            <Checkbox
              v-model="allowedSubtopics"
              :inputId="subtopic._id"
              :value="subtopic._id"
            />
            <label :for="subtopic._id" class="subtopic-label">
              {{ subtopic.name }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Anuluj" text @click="closeDialog" />
      <Button
        label="Zablokuj"
        icon="pi pi-ban"
        severity="danger"
        :disabled="!userToBlock"
        @click="handleBlock"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useToastHelper } from "../../../composables/useToastHelper";
import { useModeratorStore } from "../../../stores/moderator";
import { useTopicsStore } from "../../../stores/topics";
import axios from "../../../plugins/axios";

const props = defineProps({
  visible: { type: Boolean, default: false },
  topicId: { type: String, required: true },
});

const emit = defineEmits(["update:visible"]);

const { showSuccess, showError } = useToastHelper();
const moderatorStore = useModeratorStore();
const topicsStore = useTopicsStore();

const userToBlock = ref(null);
const blockReason = ref("");
const searchResults = ref([]);
const allowedSubtopics = ref([]);

const subtopics = computed(() => topicsStore.subtopics || []);

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      allowedSubtopics.value = [];
    }
  },
);

const searchUsers = async (event) => {
  try {
    const response = await axios.get("/users/search", {
      params: { query: event.query },
    });
    searchResults.value = response.data.data.users;
  } catch (error) {
    showError("Nie udało się wyszukać użytkowników", "Błąd");
  }
};

const handleBlock = async () => {
  if (!userToBlock.value) return;

  try {
    await moderatorStore.blockUser(
      props.topicId,
      userToBlock.value._id,
      blockReason.value,
      allowedSubtopics.value,
    );
    await moderatorStore.fetchBlockedUsers(props.topicId);
    showSuccess(`${userToBlock.value.username} został zablokowany`, "Sukces");
    closeDialog();
  } catch (error) {
    showError(error || "Nie udało się zablokować użytkownika", "Błąd");
  }
};

const closeDialog = () => {
  isVisible.value = false;
  userToBlock.value = null;
  blockReason.value = "";
  allowedSubtopics.value = [];
};
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.subtopics-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem;
}

.subtopic-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.subtopic-item:last-child {
  border-bottom: none;
}

.subtopic-label {
  cursor: pointer;
  user-select: none;
}

.text-muted {
  color: #64748b;
}
</style>
