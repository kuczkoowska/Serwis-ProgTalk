import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../plugins/axios";
import socketService from "../plugins/socket";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useModeratorStore = defineStore("moderator", () => {
  const loading = ref(false);
  const error = ref(null);
  const blockedUsers = ref({
    directBlocks: [],
    inheritedBlocks: [],
    allBlocks: [],
  });

  async function fetchBlockedUsers(topicId) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/moderators/${topicId}/blocked-users`);
      blockedUsers.value = res.data.data;
      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  // --- SOCKETS ---
  function initModeratorSockets(topicId) {
    const refreshList = (data) => {
      if (data.topicId === topicId) fetchBlockedUsers(topicId);
    };

    socketService.on("user_blocked_in_topic", refreshList);
    socketService.on("user_unblocked_in_topic", refreshList);
  }

  function cleanupModeratorSockets() {
    socketService.off("user_blocked_in_topic");
    socketService.off("user_unblocked_in_topic");
  }

  return {
    loading,
    error,
    blockedUsers,
    fetchBlockedUsers,
    initModeratorSockets,
    cleanupModeratorSockets,
  };
});
