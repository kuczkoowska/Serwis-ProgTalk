<template>
  <div class="admin-panel">
    <Toast />

    <div class="admin-header">
      <h1>
        <i class="pi pi-shield mr-2" style="font-size: 2rem"></i> Panel
        Administratora
      </h1>
      <p>Zarządzaj użytkownikami, tematami i systemem.</p>
    </div>

    <AdminStatsCard :stats="adminStore.stats" :loading="adminStore.loading" />

    <Tabs
      :value="String(activeTab)"
      @update:value="activeTab = Number($event)"
      class="admin-tabs"
    >
      <TabList>
        <Tab value="0">
          <div class="flex align-items-center gap-2">
            <span>Oczekujący</span>
            <Badge
              v-if="adminStore.stats.users.pending > 0"
              :value="adminStore.stats.users.pending"
              severity="warning"
            />
          </div>
        </Tab>
        <Tab value="1">Wszyscy użytkownicy</Tab>
        <Tab value="2">Wszystkie tematy</Tab>
        <Tab value="3">Logi Systemowe</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">
          <PendingUsersTab />
        </TabPanel>

        <TabPanel value="1">
          <UsersTableTab />
        </TabPanel>

        <TabPanel value="2">
          <TopicsTableTab />
        </TabPanel>

        <TabPanel value="3">
          <SystemLogsTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAdminStore } from "../../stores/admin";
import { useAdminSocketNotifications } from "../../composables/useSocketNotifications";
const adminStore = useAdminStore();
const activeTab = ref(0);

const refreshData = async () => {
  await adminStore.fetchStats();

  if (activeTab.value === 0) await adminStore.fetchPendingUsers();
  if (activeTab.value === 1) await adminStore.fetchAllUsers();
};

onMounted(() => {
  adminStore.fetchStats();
});

useAdminSocketNotifications(refreshData);
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
}

.admin-header p {
  color: #64748b;
}

.admin-tabs {
  margin-top: 2rem;
}
</style>
