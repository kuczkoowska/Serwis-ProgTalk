<template>
  <div class="flex justify-content-center align-items-center min-h-screen">
    <Card class="auth-card w-full md:w-30rem">
      <template #title>
        <div class="text-center text-2xl font-bold mb-2">Witaj w ProgTalk</div>
      </template>
      <template #subtitle>
        <div class="text-center mb-4">Zaloguj się, aby kontynuować</div>
      </template>

      <template #content>
        <Message
          v-if="blockedReason"
          severity="error"
          class="mb-4"
          :closable="false"
        >
          <div class="flex flex-column gap-2">
            <div class="font-bold">Twoje konto zostało zablokowane</div>
            <div>{{ blockedReason }}</div>
          </div>
        </Message>

        <form @submit.prevent="handleLogin">
          <div class="field mb-3">
            <label for="username" class="block mb-2 font-medium"
              >Email lub Login</label
            >
            <InputText
              id="username"
              v-model="emailOrLogin"
              placeholder="Wpisz login..."
              :invalid="submitted && !emailOrLogin"
              fluid
              class="w-full"
            />
            <small v-if="submitted && !emailOrLogin" class="text-red-500"
              >To pole jest wymagane</small
            >
          </div>

          <div class="field mb-3">
            <label for="password" class="block mb-2 font-medium">Hasło</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggleMask
              placeholder="••••••••"
              :invalid="submitted && !password"
              fluid
              class="w-full"
              inputClass="w-full"
            />
            <small v-if="submitted && !password" class="text-red-500"
              >Hasło jest wymagane</small
            >
          </div>

          <Button
            type="submit"
            label="Zaloguj się"
            :loading="isLoading"
            fluid
            class="w-full mt-2"
          />

          <div class="text-center mt-4">
            <span class="text-gray-600">Nie masz konta? </span>
            <router-link
              to="/register"
              class="font-bold no-underline text-primary"
              >Zarejestruj się</router-link
            >
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter, useRoute } from "vue-router";
import { useToastHelper } from "../../composables/useToastHelper";

const emailOrLogin = ref("");
const password = ref("");
const blockedReason = ref("");
const isLoading = ref(false);
const submitted = ref(false);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { showError } = useToastHelper();

onMounted(() => {
  if (route.query.blocked === "true") {
    blockedReason.value =
      route.query.reason || "Zablokowany przez administratora";
    showError(blockedReason.value, "Konto zablokowane");
  }
});

const handleLogin = async () => {
  submitted.value = true;
  if (!emailOrLogin.value || !password.value) return;

  isLoading.value = true;

  try {
    await authStore.login({
      identifier: emailOrLogin.value,
      password: password.value,
    });
    router.push("/");
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
