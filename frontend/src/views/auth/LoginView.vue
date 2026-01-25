<template>
  <div class="login-body">
    <Card class="login-card">
      <template #title>
        <div class="text-center">Witaj w ProgTalk</div>
      </template>
      <template #subtitle>
        <div class="text-center">Zaloguj się, aby skorzystać z serwisu</div>
      </template>

      <template #content>
        <form @submit.prevent="handleLogin">
          <div class="field mt-1">
            <label for="username">Email lub Login</label>
            <InputText
              id="username"
              v-model="emailOrLogin"
              placeholder="Wpisz swój login..."
              fluid
            />
          </div>

          <div class="field">
            <label for="password">Hasło</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggleMask
              placeholder="••••••••"
              fluid
            />
          </div>

          <Message v-if="errorMessage" severity="error">
            {{ errorMessage }}
          </Message>

          <Button
            type="submit"
            label="Zaloguj się"
            :loading="isLoading"
            fluid
          />

          <div class="text-center mt-3">
            <small
              >Nie masz jeszcze konta?
              <router-link to="/register">Zarejestruj się</router-link></small
            >
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";

const emailOrLogin = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const authStore = useAuthStore();

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await authStore.login(emailOrLogin.value, password.value);
    alert("Zalogowano pomyślnie!");
  } catch (error) {
    errorMessage.value =
      typeof error === "string" ? error : "Wystąpił błąd logowania";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-body {
  background-color: rgb(196, 236, 252);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
}

.text-center {
  text-align: center;
}

.field {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mt-1 {
  margin-top: 1rem;
}

.mt-3 {
  margin-top: 1rem;
}

a {
  color: #428fb8;
  text-decoration: none;
  font-weight: bold;
}
</style>
