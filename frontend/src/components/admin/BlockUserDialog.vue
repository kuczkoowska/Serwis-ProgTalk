<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    header="Zablokuj"
    :style="{ width: '25rem' }"
  >
    <div class="field">
      <label>Powód (opcjonalnie)</label>
      <Textarea v-model="reason" rows="4" fluid />
    </div>
    <template #footer>
      <Button
        label="Anuluj"
        severity="secondary"
        @click="$emit('update:visible', false)"
      />
      <Button
        label="Zablokuj"
        severity="danger"
        @click="confirm"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const props = defineProps(["visible", "user"]);
const emit = defineEmits(["update:visible", "blocked"]);

const reason = ref("");
const loading = ref(false);

const confirm = async () => {
  loading.value = true;
  try {
    await axios.patch(`/api/admin/users/${props.user._id}/block`, {
      reason: reason.value,
    });
    emit("blocked");
    emit("update:visible", false);
    reason.value = "";
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail:
        e.response?.data?.message || "Nie udało się zablokować użytkownika.",
    });
  } finally {
    loading.value = false;
  }
};
</script>
