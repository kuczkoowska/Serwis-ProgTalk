<template>
  <div class="system-logs-tab">
    <div class="flex flex-column md:flex-row gap-3 mb-4 align-items-center">
      <Select
        v-model="selectedActionType"
        :options="actionTypeOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Filtruj po typie akcji"
        showClear
        class="w-full md:w-20rem"
        @change="refresh"
      />
      <Button
        icon="pi pi-refresh"
        label="Odśwież"
        severity="secondary"
        @click="refresh"
      />
    </div>

    <DataTable
      :value="adminStore.logs"
      :loading="adminStore.loading"
      stripedRows
      class="p-datatable-sm"
      responsiveLayout="scroll"
    >
      <Column header="Data" style="width: 180px">
        <template #body="{ data }">
          <span class="text-color-secondary font-mono text-sm">
            {{ formatDate(data.createdAt) }}
          </span>
        </template>
      </Column>

      <Column header="Akcja" style="width: 220px">
        <template #body="{ data }">
          <Tag
            :severity="getActionSeverity(data.actionType)"
            :value="data.actionLabel || data.actionType"
          />
        </template>
      </Column>

      <Column header="Wykonał">
        <template #body="{ data }">
          <div v-if="data.performer" class="flex align-items-center gap-2">
            <Avatar
              :label="data.performer.username?.[0]"
              shape="circle"
              size="small"
            />
            <span>{{ data.performer.username }}</span>
          </div>
          <span v-else class="text-500 font-italic">System / Nieznany</span>
        </template>
      </Column>

      <Column header="Szczegóły">
        <template #body="{ data }">
          <div class="text-sm">
            <span v-if="data.targetUser"
              >User: <b>{{ data.targetUser.username }}</b></span
            >
            <span v-if="data.targetTopic" class="ml-2"
              >Temat: <b>{{ data.targetTopic.name }}</b></span
            >
            <div v-if="data.reason" class="text-500 mt-1">
              {{ data.reason }}
            </div>
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="p-4 text-center text-500">
          <i class="pi pi-history text-4xl mb-2"></i>
          <p>Brak logów systemowych</p>
        </div>
      </template>
    </DataTable>

    <Paginator
      v-if="adminStore.logsPagination.totalItems > 0"
      :rows="adminStore.logsPagination.limit"
      :totalRecords="adminStore.logsPagination.totalItems"
      :first="
        (adminStore.logsPagination.currentPage - 1) *
        adminStore.logsPagination.limit
      "
      @page="onPageChange"
      class="mt-3"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAdminStore } from "../../stores/admin";

const adminStore = useAdminStore();
const selectedActionType = ref(null);

const actionTypeOptions = computed(() => {
  return Object.entries(adminStore.actionLabels || {}).map(([key, val]) => ({
    label: val,
    value: key,
  }));
});

const refresh = () => {
  const filters = selectedActionType.value
    ? { actionType: selectedActionType.value }
    : {};
  adminStore.fetchLogs(1, 20, filters);
};

const onPageChange = (event) => {
  const filters = selectedActionType.value
    ? { actionType: selectedActionType.value }
    : {};
  adminStore.fetchLogs(event.page + 1, event.rows, filters);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString("pl-PL");
};

const getActionSeverity = (type) => {
  if (type.includes("BLOCK")) return "danger";
  if (
    type.includes("APPROVE") ||
    type.includes("UNBLOCK") ||
    type.includes("OPEN")
  )
    return "success";
  if (
    type.includes("WARN") ||
    type.includes("REJECT") ||
    type.includes("CLOSE")
  )
    return "warn";
  return "info";
};

onMounted(() => {
  refresh();
});
</script>
