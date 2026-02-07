<template>
  <div>
    <div
      v-if="adminStore.loading && adminStore.pendingUsers.length === 0"
      class="loading-container"
    >
      <ProgressSpinner />
    </div>

    <div v-else-if="adminStore.pendingUsers.length === 0" class="empty-state">
      <i class="pi pi-check-circle success-icon"></i>
      <p>Brak oczekujących użytkowników</p>
    </div>

    <div v-else class="pending-grid">
      <Card
        v-for="user in adminStore.pendingUsers"
        :key="user._id"
        class="user-card"
      >
        <template #header>
          <div class="card-header-content">
            <Avatar
              :label="user.username.charAt(0).toUpperCase()"
              shape="circle"
              size="large"
            />
            <div class="user-info">
              <span class="username">{{ user.username }}</span>
              <span>{{ user.email }}</span>
              <small class="date"
                >Zarejestrowany: {{ formatDate(user.createdAt) }}</small
              >
            </div>
          </div>
        </template>
        <template #footer>
          <div class="card-actions">
            <Button
              label="Odrzuć"
              icon="pi pi-times"
              severity="danger"
              outlined
              size="small"
              @click="handleReject(user._id)"
              :loading="processingId === user._id"
            />
            <Button
              label="Zaakceptuj"
              icon="pi pi-check"
              severity="success"
              size="small"
              @click="handleApprove(user._id)"
              :loading="processingId === user._id"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToastHelper } from "../../composables/useToastHelper";
import { useAdminStore } from "../../stores/admin";

const { showSuccess, showError, showInfo } = useToastHelper();
const adminStore = useAdminStore();
const processingId = ref(null);

onMounted(() => {
  adminStore.fetchPendingUsers();
});

const handleApprove = async (id) => {
  processingId.value = id;
  try {
    await adminStore.approveUser(id);
    showSuccess("Użytkownik aktywowany", "Zaakceptowano");
  } catch (err) {
    showError(err);
  } finally {
    processingId.value = null;
  }
};

const handleReject = async (id) => {
  processingId.value = id;
  try {
    await adminStore.rejectUser(id, "Odrzucony przez administratora");
    showInfo("Użytkownik usunięty", "Odrzucono");
  } catch (err) {
    showError(err);
  } finally {
    processingId.value = null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.success-icon {
  font-size: 3rem;
  color: #22c55e;
  margin-bottom: 1rem;
}

.pending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.user-card {
  border-radius: 12px;
  border: 2px solid #fbbf24;
  background: #fffbeb;
}

.card-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #fde68a;
  background: #fff;
}
</style>
