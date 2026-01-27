<template>
  <div class="admin-panel">
    <Toast />

    <div class="admin-header">
      <h1><i class="pi pi-shield"></i> Panel Administratora</h1>
    </div>

    <AdminStatsCard :stats="stats" />

    <TabView v-model:activeIndex="activeTab" class="admin-tabs">
      <TabPanel header="Oczekujący użytkownicy"> </TabPanel>

      <TabPanel header="Wszyscy użytkownicy"> </TabPanel>

      <TabPanel header="Wszystkie tematy"> </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import io from "socket.io-client";

import AdminStatsCard from "../../components/admin/AdminStatsCard.vue";

const stats = ref(null);
const activeTab = ref(0);

const fetchStats = async () => {
  const res = await axios.get("/api/admin/stats");
  stats.value = res.data.data;
};

const connectSocket = () => {
  const socket = io("https://localhost:3000", {});
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
