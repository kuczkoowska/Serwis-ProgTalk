<template>
  <div class="login-body">
    <Card class="login-card">
      <template #title>
        <div class="text-center">Dołącz do ProgTalk</div>
      </template>
      <template #subtitle>
        <div class="text-center">Stwórz nowe konto</div>
      </template>

      <template #content>
        <form @submit.prevent="handleRegister">
          <div class="field">
            <label>Email</label>
            <InputText
              v-model="form.email"
              placeholder="jan@przyklad.pl"
              fluid
            />
          </div>

          <div class="field">
            <label>Nazwa użytkownika</label>
            <InputText
              v-model="form.username"
              placeholder="jankowalski"
              fluid
            />
          </div>

          <div class="field">
            <label>Hasło</label>
            <Password
              v-model="form.password"
              toggleMask
              fluid
              placeholder="••••••••"
              promptLabel="Wpisz hasło"
              weakLabel="Słabe"
              mediumLabel="Średnie"
              strongLabel="Silne"
            >
              <template #footer>
                <Divider />
                <ul>
                  <li>Przynajmniej jeden znak specjalny</li>
                  <li>Przynajmniej jedna cyfra</li>
                  <li>Minimum 8 znaków</li>
                </ul>
              </template>
            </Password>
          </div>

          <div class="field">
            <label>Powtórz hasło</label>
            <Password
              v-model="form.passwordConfirm"
              :feedback="false"
              toggleMask
              fluid
              placeholder="Potwierdź hasło"
            />
          </div>

          <Message v-if="errorMessage" severity="error" class="mb-3">
            {{ errorMessage }}
          </Message>

          <Message v-if="successMessage" severity="success" class="mb-3">
            {{ successMessage }}
          </Message>

          <Button
            type="submit"
            label="Zarejestruj się"
            :loading="isLoading"
            fluid
          />

          <div class="text-center mt-3">
            <small
              >Masz już konto?
              <router-link to="/login">Zaloguj się</router-link></small
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

const form = reactive({
  email: "",
  username: "",
  password: "",
  passwordConfirm: "",
});

const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);
const authStore = useAuthStore();

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  if (form.password !== form.passwordConfirm) {
    errorMessage.value = "Hasła muszą być identyczne!";
    isLoading.value = false;
    return;
  }

  try {
    await authStore.register(form);
    successMessage.value = "Konto utworzone! Czekaj na akceptację admina.";
    form.email = "";
    form.username = "";
    form.password = "";
    form.passwordConfirm = "";
  } catch (error) {
    errorMessage.value = typeof error === "string" ? error : "Błąd rejestracji";
  } finally {
    isLoading.value = false;
  }
};
</script>
