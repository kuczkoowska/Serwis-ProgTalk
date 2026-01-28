<template>
  <div class="admin-panel">
    <Toast />

    <div class="admin-header">
      <h1><i class="pi pi-shield"></i> Panel Administratora</h1>
    </div>

    <AdminStatsCard :stats="stats" />

    <TabView v-model:activeIndex="activeTab" class="admin-tabs">
      <TabPanel header="Oczekujący użytkownicy">
        <PendingUsersTab ref="pendingTabRef" @status-changed="fetchStats" />
      </TabPanel>
      <TabPanel header="Wszyscy użytkownicy">
        <UsersTableTab ref="usersTabRef" @status-changed="fetchStats" />
      </TabPanel>
      <TabPanel header="Wszystkie tematy">
        <TopicsTableTab ref="topicsTabRef" @status-changed="fetchStats" />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import io from "socket.io-client";

import { useToast } from "primevue/usetoast";

const toast = useToast();
const stats = ref(null);
const activeTab = ref(0);

const pendingTabRef = ref(null);
const usersTabRef = ref(null);

const fetchStats = async () => {
  try {
    const res = await axios.get("/api/admin/stats");
    stats.value = res.data.data;
  } catch (err) {
    console.error("Błąd pobierania statystyk:", err);
  }
};

const connectSocket = () => {
  const socket = io("https://localhost:3000", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket połączony:", socket.id);
    socket.emit("join_admin_room");
  });

  socket.on("new_user_registration", (data) => {
    toast.add({
      severity: "info",
      summary: "Nowa rejestracja",
      detail: data.message,
      life: 5000,
    });
    fetchStats();
    pendingTabRef.value?.refresh();
  });

  socket.on("user_blocked", (data) => {
    toast.add({
      severity: "warn",
      summary: "Użytkownik zablokowany",
      detail: `${data.username} został zablokowany przez ${data.blockedBy}`,
      life: 5000,
    });
    fetchStats();
    usersTabRef.value?.refresh();
  });

  socket.on("user_unblocked", (data) => {
    toast.add({
      severity: "success",
      summary: "Użytkownik odblokowany",
      detail: `${data.username} został odblokowany przez ${data.unblockedBy}`,
      life: 5000,
    });
    fetchStats();
    usersTabRef.value?.refresh();
  });

  socket.on("disconnect", () => {
    console.log("Socket rozłączony");
  });

  socket.on("connect_error", (error) => {
    console.error("Błąd połączenia socket:", error);
  });
};

onMounted(() => {
  fetchStats();
  connectSocket();
});
</script>

<style scoped>
.admin-panel {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-header h1 {
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.admin-header p {
  color: #64748b;
}

.admin-tabs {
  margin-top: 2rem;
}
</style>
