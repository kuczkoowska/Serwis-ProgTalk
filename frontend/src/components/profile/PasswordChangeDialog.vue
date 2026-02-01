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
import { reactive, computed, ref, watch } from "vue";
import { useToastHelper } from "../../composables/useToastHelper";
import { useUserStore } from "../../stores/user";

const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible"]);

const { showSuccess, showError, showWarning } = useToastHelper();
const userStore = useUserStore();
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

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        passwordForm.currentPassword = "";
        passwordForm.newPassword = "";
        passwordForm.newPasswordConfirm = "";
      }, 300);
    }
  },
);

const closeDialog = () => {
  isVisible.value = false;
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
    showWarning("Nowe hasła muszą być identyczne.");
    return;
  }

  if (!passwordForm.currentPassword) {
    showWarning("Wpisz obecne hasło.");
    return;
  }

  loading.value = true;
  try {
    const result = await userStore.updatePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.newPasswordConfirm,
    );

    showSuccess(result.message);
    closeDialog();
  } catch (error) {
    showError(error);
  } finally {
    loading.value = false;
  }
};
</script>
