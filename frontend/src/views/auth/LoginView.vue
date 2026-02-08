<template>
  <div class="auth-wrapper">
    <Card class="auth-card">
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
          <div class="field">
            <label for="username">Email lub Login</label>
            <InputText
              id="username"
              v-model="emailOrLogin"
              placeholder="Wpisz login..."
              :invalid="submitted && !emailOrLogin"
              fluid
            />
            <small v-if="submitted && !emailOrLogin" class="p-error"
              >To pole jest wymagane</small
            >
          </div>

          <div class="field">
            <label for="password">Hasło</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggleMask
              placeholder="••••••••"
              :invalid="submitted && !password"
              fluid
            />
            <small v-if="submitted && !password" class="p-error"
              >Hasło jest wymagane</small
            >
          </div>

          <Message
            v-if="errorMessage"
            severity="error"
            class="mb-3"
            :closable="false"
          >
            {{ errorMessage }}
          </Message>

          <Button
            type="submit"
            label="Zaloguj się"
            :loading="isLoading"
            fluid
          />

          <div class="text-center mt-4">
            <span class="text-gray">Nie masz konta? </span>
            <router-link to="/register">Zarejestruj się</router-link>
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

const emailOrLogin = ref("");
const password = ref("");
const errorMessage = ref("");
const blockedReason = ref("");
const isLoading = ref(false);
const submitted = ref(false);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(() => {
  // Wyczyść flagę blokady
  window.__USER_BLOCKED__ = false;

  // Sprawdź czy użytkownik został przekierowany po zablokowaniu
  if (route.query.blocked === "true") {
    blockedReason.value =
      route.query.reason || "Zablokowany przez administratora";
    // Nie czyścimy query params od razu, pozwalamy użytkownikowi zobaczyć komunikat
  }
});

const handleLogin = async () => {
  submitted.value = true;
  errorMessage.value = "";

  if (!emailOrLogin.value || !password.value) {
    return;
  }

  isLoading.value = true;

  try {
    await authStore.login(emailOrLogin.value, password.value);
    router.push("/");
  } catch (error) {
    errorMessage.value = error;
  } finally {
    isLoading.value = false;
  }
};
</script>
