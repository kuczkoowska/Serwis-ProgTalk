import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";
import socketService from "../plugins/socket";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useApplicationsStore = defineStore("applications", () => {
  const applications = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const pendingApplications = computed(() =>
    applications.value.filter((app) => app.status === "pending"),
  );

  const pendingCount = computed(() => pendingApplications.value.length);

  async function submitApplication(topicId, payload) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post(
        `/moderator-applications/${topicId}`,
        payload,
      );
      return data;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchApplications(topicId) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get(`/moderator-applications/${topicId}`);
      applications.value = data.data.applications;
    } catch (err) {
      error.value = "Nie udało się pobrać zgłoszeń.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function reviewApplication(applicationId, status, reviewNotes = "") {
    loading.value = true;
    try {
      const { data } = await api.patch(
        `/moderator-applications/review/${applicationId}`,
        { status, reviewNotes },
      );

      const appIndex = applications.value.findIndex(
        (a) => a._id === applicationId,
      );
      if (appIndex !== -1) {
        applications.value[appIndex].status = status;
        applications.value[appIndex].reviewedBy =
          data.data.application.reviewedBy;
      }
      return data;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  function clearApplications() {
    applications.value = [];
  }

  async function checkUserApplicationStatus(topicId) {
    try {
      const { data } = await api.get(
        `/moderator-applications/${topicId}/my-status`,
      );
      return data.data;
    } catch (err) {
      return { hasPendingApplication: false, application: null };
    }
  }

  function initApplicationSockets(topicId) {
    socketService.on("new_moderator_application", (data) => {
      if (data.topicId === topicId) {
        fetchApplications(topicId);
      }
    });
  }

  function cleanupApplicationSockets() {
    socketService.off("new_moderator_application");
  }

  return {
    applications,
    loading,
    error,
    pendingApplications,
    pendingCount,
    submitApplication,
    fetchApplications,
    reviewApplication,
    clearApplications,
    checkUserApplicationStatus,
    initApplicationSockets,
    cleanupApplicationSockets,
  };
});
