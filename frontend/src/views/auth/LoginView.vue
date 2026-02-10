<template>
  <div
    class="flex justify-content-center align-items-center min-h-screen surface-ground p-4"
  >
    <Card class="w-full md:w-30rem shadow-4">
      <template #title>
        <div class="text-center text-2xl font-bold mb-2 text-900">
          Witaj w ProgTalk
        </div>
      </template>
      <template #subtitle>
        <div class="text-center mb-4 text-600">
          Zaloguj się, aby kontynuować
        </div>
      </template>

      <template #content>
        <Message
          v-if="blockedReason"
          severity="error"
          class="mb-4"
          :closable="false"
        >
          <div class="font-bold mb-1">Konto zablokowane</div>
          <div>{{ blockedReason }}</div>
        </Message>

        <form @submit.prevent="handleLogin">
          <div class="flex flex-column gap-2 mb-3">
            <label for="username" class="font-medium text-900"
              >Email lub Login</label
            >
            <InputText
              id="username"
              v-model="emailOrLogin"
              placeholder="Wpisz login..."
              :invalid="submitted && !emailOrLogin"
              class="w-full"
            />
            <small v-if="submitted && !emailOrLogin" class="text-red-500"
              >Pole wymagane</small
            >
          </div>

          <div class="flex flex-column gap-2 mb-4">
            <label for="password" class="font-medium text-900">Hasło</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggleMask
              placeholder="••••••••"
              :invalid="submitted && !password"
              class="w-full"
              inputClass="w-full"
            />
            <small v-if="submitted && !password" class="text-red-500"
              >Hasło wymagane</small
            >
          </div>

          <Button
            type="submit"
            label="Zaloguj się"
            icon="pi pi-sign-in"
            :loading="isLoading"
            class="w-full"
          />

          <div class="text-center mt-4 text-600">
            Nie masz konta?
            <router-link
              to="/register"
              class="font-bold no-underline text-primary hover:underline"
            >
              Zarejestruj się
            </router-link>
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
