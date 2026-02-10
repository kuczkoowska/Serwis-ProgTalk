import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";
import socketService from "../plugins/socket";
import { useAuthStore } from "./auth";

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
    totalItems: 0,
  });

  const loading = ref(false);
  const error = ref(null);

  const hasPendingUsers = computed(() => pendingUsers.value.length > 0);

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
    try {
      const res = await api.get("/admin/extended-stats", {
        params: { limit },
      });
      extendedStats.value = res.data.data;
    } catch (err) {
      console.error("Błąd pobierania rozszerzonych statystyk:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchPendingUsers = async () => {
    loading.value = true;
    try {
      const res = await api.get("/admin/users/pending");
      pendingUsers.value = res.data.data.users;
    } catch (err) {
      console.error("Błąd pobierania oczekujących:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchAllUsers = async () => {
    loading.value = true;
    try {
      const res = await api.get("/admin/users");
      users.value = res.data.data.users;
    } catch (err) {
      console.error("Błąd pobierania listy użytkowników:", err);
    } finally {
      loading.value = false;
    }
  };

  const approveUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`);

      pendingUsers.value = pendingUsers.value.filter((u) => u._id !== userId);
      stats.value.users.pending = Math.max(0, stats.value.users.pending - 1);
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
      stats.value.users.pending = Math.max(0, stats.value.users.pending - 1);

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
      stats.value.users.blocked++;

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
      stats.value.users.blocked = Math.max(0, stats.value.users.blocked - 1);

      return true;
    } catch (err) {
      throw getError(err);
    }
  };

  const fetchLogs = async (page = 1, limit = 20, filters = {}) => {
    loading.value = true;
    try {
      const params = { page, limit, ...filters };
      const res = await api.get("/admin/logs", { params });

      logs.value = res.data.data.logs;

      if (res.data.data.actionTypes)
        actionTypes.value = res.data.data.actionTypes;
      if (res.data.data.actionLabels)
        actionLabels.value = res.data.data.actionLabels;

      if (res.data.data.pagination) {
        logsPagination.value = {
          currentPage: res.data.data.pagination.currentPage || page,
          totalPages: res.data.data.pagination.totalPages || 1,
          totalItems: res.data.data.pagination.totalItems || 0,
          limit: res.data.data.pagination.limit || limit,
        };
      }
    } catch (err) {
      console.error("Błąd pobierania logów:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchAdminTopics = async () => {
    loading.value = true;
    try {
      const res = await api.get("/admin/topics");
      topics.value = res.data.data.topics;
    } catch (err) {
      console.error("Błąd pobierania tematów:", err);
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

  function initAdminSockets() {
    socketService.joinAdminRoom();
    const authStore = useAuthStore();
    const myUsername = authStore.user?.username;

    socketService.on("new_user_registration", (data) => {
      const exists = pendingUsers.value.find((u) => u._id === data.id);
      if (!exists) {
        pendingUsers.value.unshift({
          _id: data.id,
          email: data.email,
          username: "Nowy Użytkownik",
          createdAt: new Date().toISOString(),
        });
        stats.value.users.pending++;
      }
    });

    socketService.on("user_approved", (data) => {
      if (data.approvedBy === myUsername) return;

      pendingUsers.value = pendingUsers.value.filter(
        (u) => u._id !== data.userId,
      );
      stats.value.users.pending = Math.max(0, stats.value.users.pending - 1);
      stats.value.users.total++;

      if (users.value.length > 0) fetchAllUsers();
    });

    socketService.on("user_rejected", (data) => {
      if (data.rejectedBy === myUsername) return;

      fetchPendingUsers();
      stats.value.users.pending = Math.max(0, stats.value.users.pending - 1);
    });

    socketService.on("user_blocked", (data) => {
      if (data.blockedBy === myUsername) return;

      const user = users.value.find((u) => u._id === data.userId);
      if (user) {
        user.isBlocked = true;
        user.blockReason = data.reason;
      }
      stats.value.users.blocked++;
    });

    socketService.on("user_unblocked", (data) => {
      if (data.unblockedBy === myUsername) return;

      const user = users.value.find((u) => u._id === data.userId);
      if (user) {
        user.isBlocked = false;
        user.blockReason = null;
      }
      stats.value.users.blocked = Math.max(0, stats.value.users.blocked - 1);
    });
  }

  function cleanupAdminSockets() {
    socketService.off("new_user_registration");
    socketService.off("user_approved");
    socketService.off("user_rejected");
    socketService.off("user_blocked");
    socketService.off("user_unblocked");
  }

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

    initAdminSockets,
    cleanupAdminSockets,
  };
});
