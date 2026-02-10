<template>
  <div>
    <div
      class="p-3 border-1 border-round cursor-pointer hover:surface-hover transition-colors transition-duration-200 flex align-items-center justify-content-between"
      :class="
        pendingCount > 0
          ? 'bg-orange-50 border-orange-200'
          : 'bg-surface-0 border-300'
      "
      @click="showDialog = true"
    >
      <div class="flex align-items-center gap-2">
        <i
          class="pi pi-users"
          :class="pendingCount > 0 ? 'text-orange-500' : 'text-700'"
        ></i>
        <span
          class="font-bold text-sm"
          :class="pendingCount > 0 ? 'text-orange-900' : 'text-700'"
        >
          Kandydaci na moderatora
        </span>
      </div>
      <Badge v-if="pendingCount > 0" :value="pendingCount" severity="warning" />
      <i v-else class="pi pi-angle-right text-500"></i>
    </div>

    <Dialog
      v-model:visible="showDialog"
      modal
      header="Zgłoszenia na moderatora"
      :style="{ width: '600px' }"
    >
      <div
        v-if="applicationsStore.loading"
        class="flex justify-content-center p-4"
      >
        <ProgressSpinner />
      </div>

      <div
        v-else-if="applications.length === 0"
        class="text-center p-5 text-500"
      >
        <i class="pi pi-check-circle text-4xl mb-2 text-green-500"></i>
        <p class="m-0">Brak nowych zgłoszeń.</p>
      </div>

      <div v-else class="flex flex-column gap-3">
        <div
          v-for="app in applications"
          :key="app._id"
          class="surface-card p-3 border-1 surface-border border-round"
        >
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex align-items-center gap-2">
              <Avatar
                :label="app.applicant?.username[0]"
                shape="circle"
                class="bg-blue-100 text-blue-700"
              />
              <div>
                <div class="font-bold">{{ app.applicant?.username }}</div>
                <div class="text-xs text-500">
                  {{ formatDate(app.createdAt) }}
                </div>
              </div>
            </div>
            <Tag :value="app.availability" severity="info" />
          </div>

          <div class="mb-3">
            <div class="text-xs font-bold uppercase text-500 mb-1">
              Motywacja:
            </div>
            <p class="m-0 text-sm line-height-3">{{ app.motivation }}</p>
          </div>

          <div v-if="app.experience" class="mb-3">
            <div class="text-xs font-bold uppercase text-500 mb-1">
              Doświadczenie:
            </div>
            <p class="m-0 text-sm line-height-3">{{ app.experience }}</p>
          </div>

          <div class="flex justify-content-end gap-2">
            <Button
              label="Odrzuć"
              icon="pi pi-times"
              severity="danger"
              size="small"
              outlined
              @click="handleReview(app._id, 'rejected')"
              :loading="processingId === app._id"
            />
            <Button
              label="Zatwierdź"
              icon="pi pi-check"
              severity="success"
              size="small"
              @click="handleReview(app._id, 'approved')"
              :loading="processingId === app._id"
            />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useToastHelper } from "../../../composables/useToastHelper";
import { useApplicationsStore } from "../../../stores/applications";
import { useTopicsStore } from "../../../stores/topics";

const props = defineProps({
  topicId: { type: String, required: true },
});

const { showSuccess, showError } = useToastHelper();
const applicationsStore = useApplicationsStore();
const topicsStore = useTopicsStore();

const showDialog = ref(false);
const processingId = ref(null);

const applications = computed(() => applicationsStore.pendingApplications);
const pendingCount = computed(() => applicationsStore.pendingCount);

const formatDate = (date) => new Date(date).toLocaleDateString();

const handleReview = async (appId, status) => {
  processingId.value = appId;
  try {
    await applicationsStore.reviewApplication(appId, status);
    if (status === "approved") {
      showSuccess("Nowy moderator dodany!");
      await topicsStore.fetchTopicDetails(props.topicId);
    }
  } catch (error) {
    showError(error);
  } finally {
    processingId.value = null;
  }
};

onMounted(() => {
  applicationsStore.fetchApplications(props.topicId);
  applicationsStore.initApplicationSockets(props.topicId);
});
</script>
