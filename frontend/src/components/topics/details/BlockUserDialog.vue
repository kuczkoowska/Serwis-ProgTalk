<template>
  <Dialog
    v-model:visible="isVisible"
    header="Zablokuj użytkownika"
    :style="{ width: '450px' }"
    modal
  >
    <div class="block-dialog-content">
      <p class="mb-3">Wyszukaj użytkownika, którego chcesz zablokować:</p>

      <div>
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

const userToBlock = ref(null);
const blockReason = ref("");
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

const handleBlock = async () => {
  if (!userToBlock.value) return;

  try {
    await topicsStore.blockUser(
      props.topicId,
      userToBlock.value._id,
      blockReason.value,
    );
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: `${userToBlock.value.username} został zablokowany`,
      life: 3000,
    });
    closeDialog();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się zablokować użytkownika",
      life: 3000,
    });
  }
};

const closeDialog = () => {
  isVisible.value = false;
  userToBlock.value = null;
  blockReason.value = "";
};
</script>

<style scoped></style>
