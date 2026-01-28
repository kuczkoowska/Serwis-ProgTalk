<template>
  <Dialog
    v-model:visible="isVisible"
    header="Zmiana hasła"
    :style="{ width: '450px' }"
    modal
  >
    <div>
      <div class="field mb-3">
        <label for="currentPassword">Obecne hasło</label>
        <Password
          id="currentPassword"
          v-model="passwordForm.currentPassword"
          :feedback="false"
          toggleMask
          fluid
        />
      </div>

      <div class="field mb-3">
        <label for="newPassword">Nowe hasło</label>
        <Password
          id="newPassword"
          v-model="passwordForm.newPassword"
          toggleMask
          fluid
        />
      </div>

      <div class="field mb-3">
        <label for="newPasswordConfirm">Potwierdź nowe hasło</label>
        <Password
          id="newPasswordConfirm"
          v-model="passwordForm.newPasswordConfirm"
          :feedback="false"
          toggleMask
          fluid
        />
      </div>
    </div>

    <template #footer>
      <Button label="Anuluj" text @click="closeDialog" />
      <Button
        label="Zmień hasło"
        icon="pi pi-check"
        @click="changePassword"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "../../stores/auth";

const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible"]);

const toast = useToast();
const authStore = useAuthStore();
const loading = ref(false);

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  newPasswordConfirm: "",
});

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
    toast.add({
      severity: "warn",
      summary: "Uwaga",
      detail: "Nowe hasła nie są identyczne",
      life: 3000,
    });
    return;
  }

  loading.value = true;

  try {
    await authStore.updatePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.newPasswordConfirm,
    );
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: "Hasło zostało zmienione",
      life: 3000,
    });
    closeDialog();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się zmienić hasła",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  isVisible.value = false;
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.newPasswordConfirm = "";
};
</script>
