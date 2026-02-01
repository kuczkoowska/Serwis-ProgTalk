<template>
  <div class="custom-card layout-container">
    <h3>Ustawienia konta</h3>

    <div v-if="user">
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
          :loading="userStore.loading"
        />
      </div>
    </div>

    <PasswordChangeDialog v-model:visible="showPasswordDialog" />
  </div>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { useToastHelper } from "../../composables/useToastHelper";
import { useUserStore } from "../../stores/user";

const props = defineProps(["user"]);
const { showSuccess, showError } = useToastHelper();
const userStore = useUserStore();
const showPasswordDialog = ref(false);

const form = reactive({
  email: "",
  username: "",
  bio: "",
});

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.email = newUser.email || "";
      form.username = newUser.username || "";
      form.bio = newUser.bio || "";
    }
  },
  { immediate: true },
);

const saveSettings = async () => {
  try {
    const result = await userStore.updateProfile(form.bio, form.username);
    showSuccess(result.message);
  } catch (error) {
    showError(error);
  }
};
</script>
