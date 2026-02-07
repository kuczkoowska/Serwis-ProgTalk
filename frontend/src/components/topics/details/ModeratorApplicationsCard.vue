<template>
  <div v-if="canManage">
    <div class="applicant-trigger-card" @click="showDialog = true">
      <div class="trigger-content">
        <div class="trigger-text">
          <span class="trigger-title">Kandydaci</span>
          <span class="trigger-subtitle">Zarządzaj zgłoszeniami</span>
        </div>
      </div>

      <div class="trigger-action">
        <Badge
          v-if="pendingCount > 0"
          :value="pendingCount"
          severity="danger"
        />
        <i v-else class="pi pi-angle-right text-gray-400"></i>
      </div>
    </div>

    <Dialog
      v-model:visible="showDialog"
      modal
      header="Oczekujące zgłoszenia"
      :style="{ width: '650px', maxWidth: '95vw' }"
      class="custom-dialog"
      :draggable="false"
    >
      <div v-if="loading" class="flex justify-content-center p-6">
        <ProgressSpinner strokeWidth="4" style="width: 50px; height: 50px" />
      </div>

      <div v-else-if="pendingApplications.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-check text-3xl"></i>
        </div>
        <h3>Wszystko czyste!</h3>
        <p>Brak nowych zgłoszeń na moderatora.</p>
      </div>

      <div v-else class="applications-list">
        <div
          v-for="app in pendingApplications"
          :key="app._id"
          class="application-card"
        >
          <div class="card-header">
            <div class="user-profile">
              <Avatar
                :label="app.applicant?.username?.[0]?.toUpperCase()"
                shape="circle"
                class="user-avatar"
              />
              <div class="user-info">
                <div class="user-name">{{ app.applicant?.username }}</div>
                <div class="user-date">
                  <i class="pi pi-clock"></i>
                  <span>{{ formatDate(app.createdAt) }}</span>
                </div>
              </div>
            </div>

            <Tag
              :value="getAvailabilityLabel(app.availability)"
              :severity="getAvailabilitySeverity(app.availability)"
              class="availability-tag"
              rounded
            />
          </div>

          <div class="card-body">
            <div class="content-section">
              <span class="section-label">
                <i class="pi pi-comment"></i> Motywacja
              </span>
              <p class="section-text">{{ app.motivation }}</p>
            </div>

            <div v-if="app.experience" class="mt-3">
              <div class="divider"></div>
              <span class="section-label mt-3">
                <i class="pi pi-star"></i> Doświadczenie
              </span>
              <p class="section-text">{{ app.experience }}</p>
            </div>
          </div>

          <div class="card-footer">
            <Button
              label="Odrzuć"
              icon="pi pi-times"
              severity="danger"
              text
              size="small"
              :loading="processingId === app._id"
              @click="handleReview(app._id, 'rejected')"
            />
            <Button
              label="Zatwierdź"
              icon="pi pi-check"
              severity="success"
              size="small"
              :loading="processingId === app._id"
              @click="handleReview(app._id, 'approved')"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Zamknij"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="showDialog = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useToastHelper } from "../../../composables/useToastHelper";
import { useTopicsStore } from "../../../stores/topics";
import { useApplicationsStore } from "../../../stores/applications";

const props = defineProps({
  topicId: { type: String, required: true },
});

const emit = defineEmits(["moderator-added"]);
const { showSuccess, showError, showInfo } = useToastHelper();
const topicsStore = useTopicsStore();
const applicationsStore = useApplicationsStore();

const showDialog = ref(false);
const processingId = ref(null);

const canManage = computed(() => topicsStore.canManage);
const pendingApplications = computed(
  () => applicationsStore.pendingApplications,
);
const pendingCount = computed(() => applicationsStore.pendingCount);
const loading = computed(() => applicationsStore.loading);

const getAvailabilityLabel = (val) => {
  const map = {
    low: "Niska dostępność",
    moderate: "Średnia dostępność",
    high: "Wysoka dostępność",
  };
  return map[val] || val;
};

const getAvailabilitySeverity = (val) => {
  const map = { low: "warning", moderate: "info", high: "success" };
  return map[val] || "secondary";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetchApplications = async () => {
  if (!canManage.value) return;
  await applicationsStore.fetchApplications(props.topicId);
};

const handleReview = async (appId, status) => {
  processingId.value = appId;
  try {
    await applicationsStore.reviewApplication(appId, status);
    if (status === "approved") {
      showSuccess("Nowy moderator dodany!");
      emit("moderator-added");
    } else {
      showInfo("Zgłoszenie odrzucone.");
    }
  } catch (error) {
    showError(error);
  } finally {
    processingId.value = null;
  }
};

onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.applicant-trigger-card {
  background-color: #ffffff;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  margin-bottom: 1rem;
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.trigger-text {
  display: flex;
  flex-direction: column;
}

.trigger-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.trigger-subtitle {
  font-size: 0.85rem;
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  width: 60px;
  height: 60px;
  background-color: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.application-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  font-size: 1.25rem;
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
}

.user-date {
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.availability-tag {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
}

.card-body {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid #f1f5f9;
}

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-text {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 1rem 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
