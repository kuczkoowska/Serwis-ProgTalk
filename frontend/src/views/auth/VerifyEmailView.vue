<template>
  <div
    class="flex justify-content-center align-items-center min-h-screen surface-ground p-4"
  >
    <Card class="w-full md:w-30rem text-center shadow-4">
      <template #title>
        <div class="text-2xl font-bold text-900">Weryfikacja Email</div>
      </template>

      <template #content>
        <div
          v-if="status === 'loading'"
          class="flex flex-column align-items-center gap-3 py-4"
        >
          <ProgressSpinner style="width: 50px; height: 50px" />
          <p class="text-700 m-0">Weryfikujemy Twój adres e-mail...</p>
        </div>

        <div
          v-if="status === 'success'"
          class="flex flex-column align-items-center gap-3 py-4"
        >
          <i class="pi pi-check-circle text-green-500 text-6xl"></i>
          <h3 class="text-xl font-bold m-0 text-900">Sukces!</h3>
          <p class="text-700 m-0">{{ message }}</p>
          <small class="text-500">Przekierowanie do logowania...</small>
        </div>

        <div
          v-if="status === 'error'"
          class="flex flex-column align-items-center gap-3 py-4"
        >
          <i class="pi pi-times-circle text-red-500 text-6xl"></i>
          <h3 class="text-xl font-bold m-0 text-900">Błąd</h3>
          <p class="text-700 m-0">{{ message }}</p>
          <router-link to="/login" class="mt-2">
            <Button label="Wróć do logowania" severity="secondary" />
          </router-link>
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
