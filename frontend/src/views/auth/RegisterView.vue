<template>
  <div
    class="flex justify-content-center align-items-center min-h-screen surface-ground p-4"
  >
    <Card class="w-full md:w-30rem shadow-4">
      <template #title>
        <div class="text-center text-2xl font-bold mb-2 text-900">
          Dołącz do nas
        </div>
      </template>
      <template #subtitle>
        <div class="text-center mb-4 text-600">Utwórz nowe konto</div>
      </template>

      <template #content>
        <form @submit.prevent="handleRegister">
          <div class="flex flex-column gap-2 mb-3">
            <label class="font-medium text-900">Email</label>
            <InputText
              v-model="form.email"
              placeholder="jan@przyklad.pl"
              :invalid="submitted && !form.email"
              class="w-full"
            />
            <small v-if="submitted && !form.email" class="text-red-500"
              >Email jest wymagany</small
            >
          </div>

          <div class="flex flex-column gap-2 mb-3">
            <label class="font-medium text-900">Nazwa użytkownika</label>
            <InputText
              v-model="form.username"
              placeholder="jankowalski"
              :invalid="submitted && !form.username"
              class="w-full"
            />
            <small v-if="submitted && !form.username" class="text-red-500"
              >Nazwa wymagana</small
            >
          </div>

          <div class="flex flex-column gap-2 mb-3">
            <label class="font-medium text-900">Hasło</label>
            <Password
              v-model="form.password"
              toggleMask
              class="w-full"
              inputClass="w-full"
              placeholder="••••••••"
              promptLabel="Wpisz hasło"
              weakLabel="Słabe"
              mediumLabel="Średnie"
              strongLabel="Silne"
              :invalid="submitted && !form.password"
            >
              <template #footer>
                <Divider />
                <ul class="pl-2 ml-2 mt-0 line-height-3 text-600">
                  <li>Minimum 6 znaków</li>
                </ul>
              </template>
            </Password>
            <small v-if="submitted && !form.password" class="text-red-500"
              >Hasło wymagane</small
            >
          </div>

          <div class="flex flex-column gap-2 mb-4">
            <label class="font-medium text-900">Powtórz hasło</label>
            <Password
              v-model="form.passwordConfirm"
              :feedback="false"
              toggleMask
              class="w-full"
              inputClass="w-full"
              placeholder="Potwierdź hasło"
              :invalid="submitted && !form.passwordConfirm"
            />
            <small
              v-if="submitted && !form.passwordConfirm"
              class="text-red-500"
              >Potwierdzenie wymagane</small
            >
          </div>

          <Button
            type="submit"
            label="Zarejestruj się"
            icon="pi pi-user-plus"
            :loading="isLoading"
            class="w-full"
          />

          <div class="text-center mt-4 text-600">
            Masz już konto?
            <router-link
              to="/login"
              class="font-bold no-underline text-primary hover:underline"
            >
              Zaloguj się
            </router-link>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useToastHelper } from "../../composables/useToastHelper";

const form = reactive({
  email: "",
  username: "",
  password: "",
  passwordConfirm: "",
});

const isLoading = ref(false);
const submitted = ref(false);

const authStore = useAuthStore();
const { showSuccess, showError } = useToastHelper();

const handleRegister = async () => {
  submitted.value = true;
  if (!form.email || !form.username || !form.password || !form.passwordConfirm)
    return;

  if (form.password !== form.passwordConfirm) {
    showError("Hasła muszą być identyczne!");
    return;
  }

  isLoading.value = true;
  try {
    const response = await authStore.register({ ...form });
    showSuccess(response.message, "Witamy!");
    Object.assign(form, {
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
    });
    submitted.value = false;
  } catch (error) {
    showError(error);
  } finally {
    isLoading.value = false;
  }
};
</script>
