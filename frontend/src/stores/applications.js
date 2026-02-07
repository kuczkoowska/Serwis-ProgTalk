import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useApplicationsStore = defineStore("applications", () => {
  const applications = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const pendingApplications = computed(() =>
    applications.value.filter((app) => app.status === "pending"),
  );

  const approvedApplications = computed(() =>
    applications.value.filter((app) => app.status === "approved"),
  );

  const rejectedApplications = computed(() =>
    applications.value.filter((app) => app.status === "rejected"),
  );

  const applicationsCount = computed(() => applications.value.length);
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
    error.value = null;
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
      }

      return data;
    } catch (err) {
      throw getError(err);
    }
  }

  function clearApplications() {
    applications.value = [];
  }

  function addOrUpdateApplication(application) {
    const existingIndex = applications.value.findIndex(
      (app) => app._id === application._id,
    );

    if (existingIndex !== -1) {
      applications.value[existingIndex] = application;
    } else {
      applications.value.unshift(application);
    }
  }

  async function refreshApplicationsForTopic(topicId) {
    try {
      await fetchApplications(topicId);
    } catch (err) {
      console.error("Błąd odświeżania aplikacji:", err);
    }
  }

  async function checkUserApplicationStatus(topicId) {
    try {
      const { data } = await api.get(
        `/moderator-applications/${topicId}/my-status`,
      );
      return data.data;
    } catch (err) {
      console.error("Błąd sprawdzania statusu aplikacji:", err);
      return { hasPendingApplication: false, application: null };
    }
  }

  return {
    applications,
    loading,
    error,

    pendingApplications,
    approvedApplications,
    rejectedApplications,
    applicationsCount,
    pendingCount,

    submitApplication,
    fetchApplications,
    reviewApplication,
    clearApplications,
    addOrUpdateApplication,
    refreshApplicationsForTopic,
    checkUserApplicationStatus,
  };
});
