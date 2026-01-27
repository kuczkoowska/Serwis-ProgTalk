<template>
  <div class="pending-approval-wrapper">
    <Card class="approval-card">
      <template #header>
        <div class="card-header">
          <i class="pi pi-clock"></i>
        </div>
      </template>

      <template #title>
        <h2>Oczekiwanie na zatwierdzenie</h2>
      </template>

      <template #content>
        <p class="message">
          Twoje konto zostało pomyślnie utworzone i oczekuje na zatwierdzenie
          przez administratora.
        </p>
        <p class="submessage">
          Otrzymasz dostęp do serwisu po akceptacji Twojej rejestracji. Może to
          potrwać kilka godzin.
        </p>

        <div class="info-box">
          <i class="pi pi-info-circle"></i>
          <div>
            <p><strong>Co teraz?</strong></p>
            <ul>
              <li>Poczekaj na email z potwierdzeniem</li>
              <li>Administrator rozpatrzy Twoją rejestrację</li>
              <li>
                Po zatwierdzeniu będziesz mógł w pełni korzystać z serwisu
              </li>
            </ul>
          </div>
        </div>
      </template>

      <template #footer>
        <Button
          label="Wyloguj"
          icon="pi pi-sign-out"
          severity="secondary"
          outlined
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

<style scoped>
.pending-approval-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.approval-card {
  border-radius: 16px;
}

.card-header {
  border-radius: 16px;
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: #fcbe12;
}

.card-header i {
  font-size: 4rem;
  color: white;
}

.approval-card h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.message {
  text-align: center;
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 0.5rem;
}

.submessage {
  text-align: center;
  color: #64748b;
  margin-bottom: 2rem;
}

.info-box {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.info-box i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.info-box p {
  margin: 0 0 0.5rem 0;
  color: #1e40af;
}

.info-box li {
  margin-bottom: 0.5rem;
}
</style>
