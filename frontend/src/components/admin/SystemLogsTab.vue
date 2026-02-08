<template>
  <div class="system-logs-tab">
    <!-- Filtry -->
    <div class="logs-filters">
      <Select
        v-model="selectedActionType"
        :options="actionTypeOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Filtruj po typie akcji"
        showClear
        class="filter-select"
        @change="fetchLogs"
      />
      <Button
        icon="pi pi-refresh"
        label="Odśwież"
        severity="secondary"
        @click="fetchLogs"
      />
    </div>

    <DataTable
      :value="logs"
      :loading="loading"
      stripedRows
      class="logs-table"
      responsiveLayout="scroll"
    >
      <Column header="Data" style="width: 180px">
        <template #body="{ data }">
          <span class="log-date">
            {{ formatDate(data.createdAt) }}
          </span>
        </template>
      </Column>

      <Column header="Akcja" style="width: 220px">
        <template #body="{ data }">
          <Tag
            :severity="getActionSeverity(data.actionType)"
            :value="data.actionLabel"
          />
        </template>
      </Column>

      <Column header="Wykonał" style="width: 150px">
        <template #body="{ data }">
          <div v-if="data.performer" class="user-cell">
            <Avatar :user="data.performer" size="small" />
            <span>{{ data.performer.username }}</span>
          </div>
          <span v-else-if="data.performerEmailSnapshot" class="text-muted">
            {{ data.performerEmailSnapshot }}
          </span>
          <span v-else class="text-muted">System</span>
        </template>
      </Column>

      <Column header="Cel - Użytkownik">
        <template #body="{ data }">
          <div v-if="data.targetUser" class="user-cell">
            <Avatar :user="data.targetUser" size="small" />
            <span>{{ data.targetUser.username }}</span>
          </div>
          <span v-else class="text-muted">-</span>
        </template>
      </Column>

      <Column header="Cel - Temat">
        <template #body="{ data }">
          <router-link
            v-if="data.targetTopic"
            :to="{ name: 'TopicDetails', params: { id: data.targetTopic._id } }"
            class="topic-link"
          >
            {{ data.targetTopic.name }}
          </router-link>
          <span v-else class="text-muted">-</span>
        </template>
      </Column>

      <Column header="Powód">
        <template #body="{ data }">
          <span v-if="data.reason" class="reason-text">{{ data.reason }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-history"></i>
          <p>Brak logów systemowych</p>
        </div>
      </template>
    </DataTable>

    <Paginator
      v-if="pagination.totalLogs > 0"
      :rows="pagination.limit"
      :totalRecords="pagination.totalLogs"
      :first="(pagination.page - 1) * pagination.limit"
      :rowsPerPageOptions="[10, 20, 50]"
      template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Strona {currentPage} z {totalPages}"
      @page="onPageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/axios";

const logs = ref([]);
const loading = ref(false);
const selectedActionType = ref(null);

const actionTypeOptions = ref([]);

const pagination = ref({
  page: 1,
  limit: 20,
  totalPages: 1,
  totalLogs: 0,
});

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (selectedActionType.value) {
      params.actionType = selectedActionType.value;
    }

    const res = await api.get("/admin/logs", { params });
    logs.value = res.data.data.logs;
    pagination.value = {
      ...pagination.value,
      ...res.data.pagination,
    };

    if (actionTypeOptions.value.length === 0 && res.data.data.actionLabels) {
      actionTypeOptions.value = Object.entries(res.data.data.actionLabels).map(
        ([value, label]) => ({ value, label }),
      );
    }
  } catch (err) {
    console.error("Błąd pobierania logów:", err);
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event) => {
  pagination.value.page = event.page + 1;
  pagination.value.limit = event.rows;
  fetchLogs();
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getActionSeverity = (actionType) => {
  const severityMap = {
    USER_BLOCK_GLOBAL: "danger",
    USER_UNBLOCK_GLOBAL: "success",
    USER_BLOCK_TOPIC: "warn",
    USER_UNBLOCK_TOPIC: "success",
    TOPIC_CREATE: "info",
    TOPIC_CLOSE: "warn",
    TOPIC_OPEN: "success",
    TOPIC_HIDE: "danger",
    TOPIC_UNHIDE: "success",
    MODERATOR_ADD: "info",
    MODERATOR_REMOVE: "warn",
    USER_APPROVE: "success",
    USER_REJECT: "danger",
    LOGIN_FAILED: "danger",
    LOGIN_SUCCESS: "secondary",
  };
  return severityMap[actionType] || "secondary";
};

const refresh = () => {
  pagination.value.page = 1;
  fetchLogs();
};

defineExpose({ refresh });

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.system-logs-tab {
  padding: 1rem 0;
}

.logs-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.filter-select {
  min-width: 250px;
}

.logs-table {
  margin-bottom: 1rem;
}

.log-date {
  font-family: monospace;
  font-size: 0.9rem;
  color: #64748b;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topic-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.topic-link:hover {
  text-decoration: underline;
}

.text-muted {
  color: #94a3b8;
  font-style: italic;
}

.reason-text {
  font-size: 0.9rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #64748b;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>
