import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useAdminStore = defineStore("admin", () => {
  const stats = ref({
    users: { total: 0, pending: 0, blocked: 0 },
    topics: { total: 0, closed: 0, hidden: 0 },
  });

  const extendedStats = ref({
    popularTopicsByPosts: [],
    popularPosts: [],
  });

  const users = ref([]);
  const pendingUsers = ref([]);
  const topics = ref([]);
  const logs = ref([]);

  const actionTypes = ref({});
  const actionLabels = ref({});

  const logsPagination = ref({
    currentPage: 1,
    totalPages: 1,
    limit: 20,
  });

  const loading = ref(false);
  const error = ref(null);

  const hasPendingUsers = computed(() => pendingUsers.value.length > 0);
  const blockedUsersCount = computed(
    () => users.value.filter((u) => u.isBlocked).length,
  );

  const fetchStats = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/admin/stats");
      stats.value = res.data.data;
    } catch (err) {
      error.value = "Błąd pobierania statystyk.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchExtendedStats = async (limit = 10) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/admin/extended-stats", {
        params: { limit },
      });
      extendedStats.value = res.data.data;
    } catch (err) {
      error.value = "Błąd pobierania rozszerzonych statystyk.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchPendingUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/admin/users/pending");
      pendingUsers.value = res.data.data.users;
    } catch (err) {
      error.value = "Błąd pobierania oczekujących użytkowników.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchAllUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/admin/users");
      users.value = res.data.data.users;
    } catch (err) {
      error.value = "Błąd pobierania listy użytkowników.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const approveUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`);

      pendingUsers.value = pendingUsers.value.filter((u) => u._id !== userId);
      stats.value.users.pending--;
      stats.value.users.total++;

      return true;
    } catch (err) {
      throw getError(err);
    }
  };

  const rejectUser = async (userId, reason) => {
    try {
      await api.delete(`/admin/users/${userId}/reject`, { data: { reason } });

      pendingUsers.value = pendingUsers.value.filter((u) => u._id !== userId);
      stats.value.users.pending--;

      return true;
    } catch (err) {
      throw getError(err);
    }
  };

  const blockUser = async (userId, reason) => {
    try {
      await api.patch(`/admin/users/${userId}/block`, { reason });

      const user = users.value.find((u) => u._id === userId);
      if (user) {
        user.isBlocked = true;
        user.blockReason = reason;
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  };

  const unblockUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/unblock`);

      const user = users.value.find((u) => u._id === userId);
      if (user) {
        user.isBlocked = false;
        user.blockReason = null;
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  };

  const fetchLogs = async (page = 1, limit = 20, filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const params = {
        page,
        limit,
        ...filters,
      };

      const res = await api.get("/admin/logs", { params });

      logs.value = res.data.data.logs;

      // Zapisz typy akcji i etykiety z odpowiedzi backendu
      if (res.data.data.actionTypes) {
        actionTypes.value = res.data.data.actionTypes;
      }
      if (res.data.data.actionLabels) {
        actionLabels.value = res.data.data.actionLabels;
      }

      if (res.data.data.pagination) {
        logsPagination.value = {
          currentPage: res.data.data.pagination.currentPage || page,
          totalPages: res.data.data.pagination.totalPages || 1,
          totalItems: res.data.data.pagination.totalItems || 0,
          limit: res.data.data.pagination.limit || limit,
        };
      }
    } catch (err) {
      error.value = "Błąd pobierania logów.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchAdminTopics = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/admin/topics");
      topics.value = res.data.data.topics;
    } catch (err) {
      error.value = "Błąd pobierania tematów.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const transferTopicOwnership = async (topicId, newOwnerId) => {
    try {
      await api.patch(`/admin/transfer-ownership/${topicId}`, { newOwnerId });
      await fetchAdminTopics();
      return true;
    } catch (err) {
      throw getError(err);
    }
  };

  return {
    stats,
    extendedStats,
    users,
    pendingUsers,
    topics,
    logs,
    actionTypes,
    actionLabels,
    logsPagination,
    loading,
    error,

    hasPendingUsers,
    blockedUsersCount,

    fetchStats,
    fetchExtendedStats,
    fetchPendingUsers,
    fetchAllUsers,
    approveUser,
    rejectUser,
    blockUser,
    unblockUser,
    fetchLogs,
    fetchAdminTopics,
    transferTopicOwnership,
  };
});
