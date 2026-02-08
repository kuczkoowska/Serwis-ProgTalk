import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../plugins/axios";

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

  return {
    loading,
    error,
    blockedUsers,

    fetchBlockedUsers,
  };
});
