<template>
  <div class="system-logs-tab">
    <LogsFilters
      :action-types="adminStore.actionTypes"
      :action-labels="adminStore.actionLabels"
      @filter-change="handleFilterChange"
      @refresh="handleRefresh"
    />

    <LogsTable
      :logs="adminStore.logs"
      :loading="adminStore.loading"
      :pagination="adminStore.logsPagination"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAdminStore } from "../../stores/admin";
import LogsFilters from "./LogsFilters.vue";
import LogsTable from "./LogsTable.vue";

const adminStore = useAdminStore();
const currentFilters = ref({});

const handleFilterChange = (actionType) => {
  const filters = {};
  if (actionType) {
    filters.actionType = actionType;
  }
  currentFilters.value = filters;
  adminStore.fetchLogs(1, adminStore.logsPagination.limit, filters);
};

const handleRefresh = (actionType) => {
  const filters = {};
  if (actionType) {
    filters.actionType = actionType;
  }
  currentFilters.value = filters;
  adminStore.fetchLogs(1, adminStore.logsPagination.limit, filters);
};

const handlePageChange = ({ page, limit }) => {
  adminStore.fetchLogs(page, limit, currentFilters.value);
};

onMounted(() => {
  adminStore.fetchLogs();
});
</script>

<style scoped>
.system-logs-tab {
  padding: 1rem 0;
}
</style>
