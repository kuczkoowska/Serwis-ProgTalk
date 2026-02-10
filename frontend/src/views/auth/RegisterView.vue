<template>
  <div class="flex justify-content-center align-items-center min-h-screen py-5">
    <Card class="auth-card w-full md:w-30rem">
      <template #title>
        <div class="text-center text-2xl font-bold mb-2">
          Dołącz do ProgTalk
        </div>
      </template>
      <template #subtitle>
        <div class="text-center mb-4">Utwórz nowe konto</div>
      </template>

      <template #content>
        <form @submit.prevent="handleRegister">
          <div class="field mb-3">
            <label class="block mb-2 font-medium">Email</label>
            <InputText
              v-model="form.email"
              placeholder="jan@przyklad.pl"
              :invalid="submitted && !form.email"
              fluid
              class="w-full"
            />
            <small v-if="submitted && !form.email" class="text-red-500"
              >Email jest wymagany</small
            >
          </div>

          <div class="field mb-3">
            <label class="block mb-2 font-medium">Nazwa użytkownika</label>
            <InputText
              v-model="form.username"
              placeholder="jankowalski"
              :invalid="submitted && !form.username"
              fluid
              class="w-full"
            />
            <small v-if="submitted && !form.username" class="text-red-500"
              >Nazwa użytkownika jest wymagana</small
            >
          </div>

          <div class="field mb-3">
            <label class="block mb-2 font-medium">Hasło</label>
            <Password
              v-model="form.password"
              toggleMask
              fluid
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
                <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                  <li>Minimum 6 znaków</li>
                </ul>
              </template>
            </Password>
            <small v-if="submitted && !form.password" class="text-red-500"
              >Hasło jest wymagane</small
            >
          </div>

          <div class="field mb-3">
            <label class="block mb-2 font-medium">Powtórz hasło</label>
            <Password
              v-model="form.passwordConfirm"
              :feedback="false"
              toggleMask
              fluid
              class="w-full"
              inputClass="w-full"
              placeholder="Potwierdź hasło"
              :invalid="submitted && !form.passwordConfirm"
            />
            <small
              v-if="submitted && !form.passwordConfirm"
              class="text-red-500"
              >Potwierdzenie hasła jest wymagane</small
            >
          </div>

          <Button
            type="submit"
            label="Zarejestruj się"
            :loading="isLoading"
            fluid
            class="w-full mt-2"
          />

          <div class="text-center mt-4">
            <span class="text-gray-600">Masz już konto? </span>
            <router-link to="/login" class="font-bold no-underline text-primary"
              >Zaloguj się</router-link
            >
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

    form.email = "";
    form.username = "";
    form.password = "";
    form.passwordConfirm = "";
    submitted.value = false;
  } catch (error) {
    showError(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
