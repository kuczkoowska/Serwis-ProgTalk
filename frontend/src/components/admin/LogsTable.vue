<template>
  <div class="logs-table-container">
    <DataTable
      :value="logs"
      :loading="loading"
      stripedRows
      class="logs-table"
      responsiveLayout="scroll"
    >
      <Column header="Data" style="width: 180px">
        <template #body="{ data }">
          <span>
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

      <Column header="Wykonał" style="width: 150px">
        <template #body="{ data }">
          <div v-if="data.performer" class="user-cell">
            <Avatar
              :label="data.performer.username?.charAt(0).toUpperCase()"
              shape="circle"
              size="normal"
            />
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
            <Avatar
              :label="data.targetUser.username?.charAt(0).toUpperCase()"
              shape="circle"
              size="normal"
            />
            <span>{{ data.targetUser.username }}</span>
          </div>
          <span v-else class="text-muted">-</span>
        </template>
      </Column>

      <Column header="Cel - Temat">
        <template #body="{ data }">
          <router-link
            v-if="data.targetTopic"
            :to="`/topic/${data.targetTopic._id}`"
            class="topic-link"
          >
            {{ data.targetTopic.name }}
          </router-link>
          <span v-else class="text-muted">-</span>
        </template>
      </Column>

      <Column header="Powód">
        <template #body="{ data }">
          <span v-if="data.reason" class="reason-text" :title="data.reason">{{
            data.reason
          }}</span>
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
      v-if="pagination.totalItems > 0"
      :rows="pagination.limit"
      :totalRecords="pagination.totalItems"
      :first="(pagination.currentPage - 1) * pagination.limit"
      :rowsPerPageOptions="[10, 20, 50]"
      template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Strona {currentPage} z {totalPages}"
      @page="handlePageChange"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  logs: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 20,
    }),
  },
});

const emit = defineEmits(["page-change"]);

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("pl-PL");
};

const getActionSeverity = (actionType) => {
  const severityMap = {
    USER_BLOCK_GLOBAL: "danger",
    USER_UNBLOCK_GLOBAL: "success",
    USER_BLOCK_TOPIC: "warn",
    USER_UNBLOCK_TOPIC: "info",
    TOPIC_CREATE: "info",
    TOPIC_CLOSE: "warn",
    TOPIC_OPEN: "success",
    TOPIC_HIDE: "warn",
    TOPIC_UNHIDE: "success",
    MODERATOR_ADD: "success",
    MODERATOR_REMOVE: "warn",
    USER_APPROVE: "success",
    USER_REJECT: "danger",
    TOPIC_OWNER_TRANSFER: "info",
    TOPIC_TAKEOVER: "warn",
    LOGIN_FAILED: "danger",
    LOGIN_SUCCESS: "success",
    EMAIL_VERIFIED: "success",
  };
  return severityMap[actionType] || "secondary";
};

const handlePageChange = (event) => {
  emit("page-change", {
    page: event.page + 1,
    limit: event.rows,
  });
};
</script>

<style scoped>
.logs-table-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.reason-text,
.details-text {
  font-size: 0.9rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
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
