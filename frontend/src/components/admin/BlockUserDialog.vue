<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    header="Zablokuj Użytkownika (Globalnie)"
    :style="{ width: '25rem' }"
  >
    <div class="field mt-3">
      <label for="reason" class="font-bold block mb-2"
        >Powód blokady (opcjonalnie)</label
      >
      <Textarea
        id="reason"
        v-model="reason"
        rows="4"
        fluid
        placeholder="Dlaczego blokujesz tego użytkownika?"
      />
    </div>

    <template #footer>
      <Button label="Anuluj" severity="secondary" text @click="closeDialog" />
      <Button
        label="Zablokuj"
        severity="danger"
        icon="pi pi-ban"
        @click="confirm"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useToastHelper } from "../../composables/useToastHelper";
import { useAdminStore } from "../../stores/admin";

const props = defineProps({
  visible: { type: Boolean, default: false },
  user: { type: Object, default: null },
});

const emit = defineEmits(["update:visible", "blocked"]);

const adminStore = useAdminStore();
const { showSuccess, showError } = useToastHelper();

const reason = ref("");
const loading = ref(false);

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        reason.value = "";
      }, 300);
    }
  },
);

const closeDialog = () => {
  emit("update:visible", false);
};

const confirm = async () => {
  if (!props.user?._id) {
    showError("Błąd: Nie wybrano użytkownika.");
    return;
  }

  loading.value = true;
  try {
    await adminStore.blockUser(props.user._id, reason.value);

    showSuccess(`Użytkownik ${props.user.username} został zablokowany.`);
    emit("blocked");
    closeDialog();
  } catch (e) {
    showError(e);
  } finally {
    loading.value = false;
  }
};
</script>
