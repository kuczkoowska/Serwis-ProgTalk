<template>
  <div class="custom-card layout-container">
    <h3>Ustawienia konta</h3>

    <div>
      <div class="field mb-3">
        <label for="email">Email</label>
        <InputText id="email" v-model="form.email" fluid disabled />
        <small>Emaila nie można zmienić.</small>
      </div>

      <div class="field mb-3">
        <label for="username">Nazwa użytkownika</label>
        <InputText id="username" v-model="form.username" fluid />
      </div>

      <div class="field mb-3">
        <label for="bio" class="block font-bold mb-1 text-sm text-gray-600"
          >O mnie</label
        >
        <Textarea
          id="bio"
          v-model="form.bio"
          rows="4"
          fluid
          autoResize
          placeholder="Napisz coś o sobie..."
        />
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <Button
          label="Zmień hasło"
          icon="pi pi-lock"
          severity="secondary"
          outlined
          @click="showPasswordDialog = true"
        />
        <Button
          label="Zapisz zmiany"
          icon="pi pi-check"
          @click="saveSettings"
          :loading="loading"
        />
      </div>
    </div>

    <PasswordChangeDialog v-model:visible="showPasswordDialog" />
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "../../stores/auth";
import PasswordChangeDialog from "./PasswordChangeDialog.vue";

const props = defineProps(["user"]);
const toast = useToast();
const authStore = useAuthStore();
const loading = ref(false);
const showPasswordDialog = ref(false);

const form = reactive({
  email: props.user?.email || "",
  username: props.user?.username || "",
  bio: props.user?.bio || "",
});

const saveSettings = async () => {
  loading.value = true;

  try {
    await authStore.updateProfile(form.bio, form.username);
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: "Profil zaktualizowany",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: error || "Nie udało się zaktualizować profilu",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped></style>
