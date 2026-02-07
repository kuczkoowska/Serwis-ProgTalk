import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";
import { useTopicsStore } from "./topics";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useModeratorStore = defineStore("moderator", () => {
  const loading = ref(false);
  const error = ref(null);
  const blockedUsers = ref({
    directBlocks: [],
    inheritedBlocks: [],
    allBlocks: [],
  });

  const isLoading = computed(() => loading.value);

  async function promoteModerator(topicId, userId) {
    loading.value = true;
    error.value = null;
    try {
      await api.post(`/moderators/${topicId}/moderators`, {
        userIdToPromote: userId,
      });

      const topicsStore = useTopicsStore();
      await topicsStore.fetchTopicDetails(topicId);

      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function revokeModerator(topicId, userId) {
    loading.value = true;
    error.value = null;
    try {
      await api.post(`/moderators/${topicId}/moderators/revoke`, {
        userIdToTake: userId,
      });

      const topicsStore = useTopicsStore();
      await topicsStore.fetchTopicDetails(topicId);

      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function blockUser(
    topicId,
    userId,
    reason = "",
    allowedSubtopicsIds = [],
  ) {
    loading.value = true;
    error.value = null;
    try {
      await api.post(`/moderators/${topicId}/block`, {
        userIdToBlock: userId,
        reason,
        allowedSubtopicsIds,
      });

      const topicsStore = useTopicsStore();
      await topicsStore.fetchTopicDetails(topicId);

      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function unblockUser(topicId, userId) {
    loading.value = true;
    error.value = null;
    try {
      await api.post(`/moderators/${topicId}/unblock`, {
        userIdToUnblock: userId,
      });

      const topicsStore = useTopicsStore();
      await topicsStore.fetchTopicDetails(topicId);

      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function closeTopic(topicId) {
    loading.value = true;
    error.value = null;
    try {
      await api.patch(`/topics/${topicId}/close`);

      const topicsStore = useTopicsStore();
      await topicsStore.fetchTopicDetails(topicId);

      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function openTopic(topicId) {
    loading.value = true;
    error.value = null;
    try {
      await api.patch(`/topics/${topicId}/open`);

      const topicsStore = useTopicsStore();
      await topicsStore.fetchTopicDetails(topicId);

      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function hideTopic(topicId) {
    loading.value = true;
    error.value = null;
    try {
      await api.patch(`/topics/${topicId}/hide`);

      const topicsStore = useTopicsStore();
      await topicsStore.fetchTopicDetails(topicId);

      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function unhideTopic(topicId) {
    loading.value = true;
    error.value = null;
    try {
      await api.patch(`/topics/${topicId}/unhide`);

      const topicsStore = useTopicsStore();
      await topicsStore.fetchTopicDetails(topicId);

      return true;
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

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

    isLoading,

    promoteModerator,
    revokeModerator,
    blockUser,
    unblockUser,
    closeTopic,
    openTopic,
    hideTopic,
    unhideTopic,
    fetchBlockedUsers,
  };
});
