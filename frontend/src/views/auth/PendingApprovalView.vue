<template>
  <div class="auth-wrapper">
    <Card class="auth-card">
      <template #header>
        <div class="card-header-icon">
          <i class="pi pi-clock"></i>
        </div>
      </template>

      <template #title>
        <div class="text-center text-xl font-bold">
          Oczekiwanie na zatwierdzenie
        </div>
      </template>

      <template #content>
        <p class="text-center text-gray mb-4">
          Twoje konto zostało utworzone. Administrator musi je teraz
          zatwierdzić, abyś mógł korzystać z serwisu.
        </p>

        <div class="info-box">
          <i class="pi pi-info-circle"></i>
          <div>
            <strong>Co dalej?</strong>
            <ul>
              <li>Poczekaj na email z potwierdzeniem.</li>
              <li>Administrator sprawdzi Twoje zgłoszenie.</li>
              <li>Po akceptacji zyskasz pełny dostęp.</li>
            </ul>
          </div>
        </div>
      </template>

      <template #footer>
        <Button
          label="Wyloguj i wróć później"
          icon="pi pi-sign-out"
          severity="secondary"
          outlined
          fluid
          @click="handleLogout"
        />
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
};
</script>
