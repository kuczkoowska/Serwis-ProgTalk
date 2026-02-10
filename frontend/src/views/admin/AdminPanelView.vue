<template>
  <div class="layout-container p-4">
    <Toast />

    <div class="flex flex-column gap-2 mb-4 text-center md:text-left">
      <h1
        class="m-0 text-900 flex align-items-center justify-content-center md:justify-content-start gap-2"
      >
        <i class="pi pi-shield text-3xl text-primary"></i>
        Panel Administratora
      </h1>
      <p class="text-600 m-0">
        Zarządzaj użytkownikami, tematami i systemem w jednym miejscu.
      </p>
    </div>

    <AdminStatsCard :stats="adminStore.stats" :loading="adminStore.loading" />

    <div class="card mt-4">
      <Tabs
        :value="String(activeTab)"
        @update:value="activeTab = Number($event)"
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
          <Tab value="1">Użytkownicy</Tab>
          <Tab value="2">Tematy</Tab>
          <Tab value="3">Logi</Tab>
          <Tab value="4">Statystyki</Tab>
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

          <TabPanel value="4">
            <ExtendedStatsTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAdminStore } from "../../stores/admin";
import AdminStatsCard from "../../components/admin/AdminStatsCard.vue";
import PendingUsersTab from "../../components/admin/PendingUsersTab.vue";
import UsersTableTab from "../../components/admin/UsersTableTab.vue";
import TopicsTableTab from "../../components/admin/TopicsTableTab.vue";
import SystemLogsTab from "../../components/admin/SystemLogsTab.vue";
import ExtendedStatsTab from "../../components/admin/ExtendedStatsTab.vue";

const adminStore = useAdminStore();
const activeTab = ref(0);

// Ładowanie danych zależnie od zakładki
const loadTabData = async () => {
  if (activeTab.value === 0) await adminStore.fetchPendingUsers();
  else if (activeTab.value === 1) await adminStore.fetchAllUsers();
  else if (activeTab.value === 2) await adminStore.fetchAdminTopics();
  else if (activeTab.value === 3) await adminStore.fetchLogs();
  else if (activeTab.value === 4) await adminStore.fetchExtendedStats();
};

watch(activeTab, loadTabData);

onMounted(() => {
  adminStore.fetchStats();
  adminStore.initAdminSockets();
  loadTabData();
});

onUnmounted(() => {
  adminStore.cleanupAdminSockets();
});
</script>
