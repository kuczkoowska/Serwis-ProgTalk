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
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const emailOrLogin = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const submitted = ref(false);

const router = useRouter();
const authStore = useAuthStore();

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
    errorMessage.value =
      typeof error === "string" ? error : "Nieprawidłowy login lub hasło.";
  } finally {
    isLoading.value = false;
  }
};
</script>
