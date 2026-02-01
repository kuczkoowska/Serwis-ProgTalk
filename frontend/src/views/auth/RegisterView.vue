<template>
  <div class="auth-wrapper">
    <Card class="auth-card">
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
          <div class="field">
            <label>Email</label>
            <InputText
              v-model="form.email"
              placeholder="jan@przyklad.pl"
              :invalid="submitted && !form.email"
              fluid
            />
            <small v-if="submitted && !form.email" class="p-error"
              >Email jest wymagany</small
            >
          </div>

          <div class="field">
            <label>Nazwa użytkownika</label>
            <InputText
              v-model="form.username"
              placeholder="jankowalski"
              :invalid="submitted && !form.username"
              fluid
            />
            <small v-if="submitted && !form.username" class="p-error"
              >Nazwa użytkownika jest wymagana</small
            >
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
              :invalid="submitted && !form.password"
            >
              <template #footer>
                <Divider />
                <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                  <li>Minimum 8 znaków</li>
                  <li>Jedna cyfra</li>
                  <li>Jeden znak specjalny</li>
                </ul>
              </template>
            </Password>
            <small v-if="submitted && !form.password" class="p-error"
              >Hasło jest wymagane</small
            >
          </div>

          <div class="field">
            <label>Powtórz hasło</label>
            <Password
              v-model="form.passwordConfirm"
              :feedback="false"
              toggleMask
              fluid
              placeholder="Potwierdź hasło"
              :invalid="submitted && !form.passwordConfirm"
            />
            <small v-if="submitted && !form.passwordConfirm" class="p-error"
              >Potwierdzenie hasła jest wymagane</small
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

          <Message
            v-if="successMessage"
            severity="success"
            class="mb-3"
            :closable="false"
          >
            {{ successMessage }}
          </Message>

          <Button
            type="submit"
            label="Zarejestruj się"
            :loading="isLoading"
            fluid
          />

          <div class="text-center mt-4">
            <span class="text-gray">Masz już konto? </span>
            <router-link to="/login">Zaloguj się</router-link>
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
const submitted = ref(false);
const authStore = useAuthStore();

const handleRegister = async () => {
  submitted.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  if (
    !form.email ||
    !form.username ||
    !form.password ||
    !form.passwordConfirm
  ) {
    return;
  }

  if (form.password !== form.passwordConfirm) {
    errorMessage.value = "Hasła muszą być identyczne!";
    return;
  }

  isLoading.value = true;

  try {
    await authStore.register({ ...form });

    successMessage.value =
      "Konto utworzone! Sprawdź email i czekaj na akceptację.";
    form.email = "";
    form.username = "";
    form.password = "";
    form.passwordConfirm = "";
    submitted.value = false;
  } catch (error) {
    errorMessage.value =
      typeof error === "string" ? error : "Wystąpił błąd podczas rejestracji.";
  } finally {
    isLoading.value = false;
  }
};
</script>
