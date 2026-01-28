<template>
  <div>
    <div v-if="loading"><ProgressSpinner /></div>
    <div v-else-if="users.length === 0">
      <BaseEmptyState
        title="Brak oczekujących użytkowników"
        icon="pi-check-circle"
      />
    </div>
    <div v-else>
      <Card v-for="user in users" :key="user._id" class="user-card">
        <template #header>
          <div class="user-card-header">
            <Avatar
              :label="user.username.charAt(0).toUpperCase()"
              shape="circle"
              size="large"
              class="user-avatar"
            />
            <div class="user-basic-info">
              <h4>{{ user.username }}</h4>
              <p>{{ user.email }}</p>
              <small>Zarejestrowany: {{ formatDate(user.createdAt) }}</small>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="user-actions">
            <Button
              label="Odrzuć"
              icon="pi pi-times"
              severity="danger"
              outlined
              @click="handleReject(user._id)"
              :loading="processingId === user._id"
            />
            <Button
              label="Zaakceptuj"
              icon="pi pi-check"
              severity="success"
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
import axios from "axios";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const users = ref([]);
const loading = ref(false);
const processingId = ref(null);

const emit = defineEmits(["status-changed"]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await axios.get("/api/admin/users/pending");
    users.value = res.data.data.users;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: "Nie udało się pobrać oczekujących użytkowników",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (id) => {
  processingId.value = id;
  try {
    await axios.patch(`/api/admin/users/${id}/approve`);
    toast.add({ severity: "success", summary: "Zaakceptowano", life: 3000 });
    await fetchData();
    emit("status-changed");
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail:
        err.response?.data?.message || "Nie udało się zaakceptować użytkownika",
      life: 3000,
    });
  } finally {
    processingId.value = null;
  }
};

const handleReject = async (id) => {
  processingId.value = id;
  try {
    await axios.delete(`/api/admin/users/${id}/reject`);
    toast.add({
      severity: "success",
      summary: "Odrzucono",
      detail: "Użytkownik został odrzucony",
      life: 3000,
    });
    await fetchData();
    emit("status-changed");
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail:
        err.response?.data?.message || "Nie udało się odrzucić użytkownika",
      life: 3000,
    });
  } finally {
    processingId.value = null;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(fetchData);

defineExpose({ refresh: fetchData });
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.empty-state i {
  font-size: 3rem;
  color: #22c55e;
  margin-bottom: 1rem;
}

.user-card {
  border-radius: 12px;
  border: 2px solid #fbbf24;
  background: #fffbeb;
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.user-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #fde68a;
}
</style>
