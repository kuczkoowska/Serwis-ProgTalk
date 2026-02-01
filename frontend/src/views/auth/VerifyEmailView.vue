<template>
  <div class="auth-wrapper">
    <Card class="auth-card text-center">
      <template #title>
        <div class="header-text">Weryfikacja Email</div>
      </template>

      <template #content>
        <div v-if="status === 'loading'" class="status-container">
          <ProgressSpinner style="width: 50px; height: 50px" />
          <p>Trwa weryfikacja Twojego adresu e-mail...</p>
        </div>

        <div v-if="status === 'success'" class="status-container success">
          <i
            class="pi pi-check-circle"
            style="font-size: 3rem; color: var(--primary-color)"
          ></i>
          <h3>Sukces!</h3>
          <p>{{ message }}</p>
          <small class="text-gray"
            >Za chwilę nastąpi przekierowanie do logowania...</small
          >
        </div>

        <div v-if="status === 'error'" class="status-container error">
          <i
            class="pi pi-times-circle"
            style="font-size: 3rem; color: #ef4444"
          ></i>
          <h3>Wystąpił błąd</h3>
          <p>{{ message }}</p>

          <div class="mt-3">
            <router-link to="/login">
              <Button label="Wróć do logowania" severity="secondary" />
            </router-link>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../plugins/axios";

const route = useRoute();
const router = useRouter();

const status = ref("loading");
const message = ref("");

onMounted(async () => {
  const token = route.params.token;

  if (!token) {
    status.value = "error";
    message.value = "Brak tokena weryfikacyjnego.";
    return;
  }

  try {
    const response = await api.get(`/auth/verify-email/${token}`);

    status.value = "success";
    message.value =
      response.data.message || "E-mail został zweryfikowany pomyślnie!";

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (error) {
    status.value = "error";
    message.value =
      error.response?.data?.message ||
      "Link weryfikacyjny jest nieprawidłowy lub wygasł.";
  }
});
</script>

<style scoped>
.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

h3 {
  margin: 0;
  color: var(--text-dark);
}

.text-gray {
  color: var(--text-muted);
}
</style>
