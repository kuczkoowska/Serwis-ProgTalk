import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useTopicsStore = defineStore("topics", () => {
  const rootTopics = ref([]);
  const currentTopic = ref(null);
  const subtopics = ref([]);
  const canPost = ref(false);
  const canManage = ref(false);
  const isBlocked = ref(false);
  const isClosed = ref(false);
  const loading = ref(false);
  const error = ref(null);

  const pagination = ref({
    currentPage: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
  });

  const searchFilters = ref({
    search: "",
    tags: [],
    sort: "newest",
    showAllLevels: false,
  });

  const topicsCount = computed(() => rootTopics.value.length);
  const hasMoreTopics = computed(() => pagination.value.hasNextPage);
  const isTopicClosed = computed(() => currentTopic.value?.isClosed || false);
  const isTopicHidden = computed(() => currentTopic.value?.isHidden || false);

  const canManageTopic = computed(() => (userId) => {
    if (!currentTopic.value || !userId) return false;

    const creatorId = currentTopic.value.creator?._id;
    if (creatorId === userId) return true;

    return (
      currentTopic.value.moderators?.some((mod) => {
        const modId = mod.user?._id;
        return modId === userId;
      }) || false
    );
  });

  const currentTopicModerators = computed(
    () => currentTopic.value?.moderators || [],
  );

  const currentTopicBlockedUsers = computed(
    () => currentTopic.value?.blockedUsers || [],
  );

  async function fetchRootTopics(customFilters = {}) {
    loading.value = true;
    error.value = null;

    const filters = { ...searchFilters.value, ...customFilters };

    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 12,
        search: filters.search || undefined,
        sort: filters.sort || "newest",
        root: !filters.showAllLevels ? "true" : undefined,
      };

      const res = await api.get("/topics", { params });

      rootTopics.value = res.data.data.topics;

      if (res.data.data.pagination) {
        const backendPag = res.data.data.pagination;
        pagination.value = {
          currentPage: backendPag.currentPage || params.page,
          limit: backendPag.limit || params.limit,
          hasNextPage: backendPag.hasNextPage || false,
        };
      }
    } catch (err) {
      error.value = "Błąd pobierania tematów.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  function setSearchFilters(filters) {
    searchFilters.value = { ...searchFilters.value, ...filters };
  }

  function resetSearchFilters() {
    searchFilters.value = {
      search: "",
      tags: [],
      sort: "newest",
      showAllLevels: false,
    };
    pagination.value.currentPage = 1;
  }

  async function fetchTopicDetails(id) {
    loading.value = true;
    currentTopic.value = null;
    subtopics.value = [];
    error.value = null;

    try {
      const res = await api.get(`/topics/${id}`);

      const data = res.data.data;

      currentTopic.value = data.topic;
      subtopics.value = data.subtopics || [];
      canPost.value = data.canPost;
      canManage.value = data.canManage;
      isBlocked.value = data.isBlocked || false;
      isClosed.value = data.isClosed || false;
    } catch (err) {
      error.value = "Nie udało się pobrać tematu.";
      if (err.response?.status === 403) {
        error.value = "Brak dostępu do tego tematu (ukryty).";
      }
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function createTopic(payload) {
    try {
      const res = await api.post("/topics", payload);
      return res.data;
    } catch (err) {
      throw getError(err);
    }
  }

  async function updateTopicMetadata(topicId, description) {
    try {
      await api.patch(`/topics/${topicId}/metadata`, { description });

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.description = description;
      }
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function deleteTopic(topicId) {
    try {
      await api.delete(`/topics/${topicId}`);

      rootTopics.value = rootTopics.value.filter((t) => t._id !== topicId);
      subtopics.value = subtopics.value.filter((t) => t._id !== topicId);

      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function closeTopic(topicId) {
    try {
      await api.patch(`/topics/${topicId}/close`);

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.isClosed = true;
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function openTopic(topicId) {
    try {
      await api.patch(`/topics/${topicId}/open`);

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.isClosed = false;
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function hideTopic(topicId) {
    try {
      await api.patch(`/topics/${topicId}/hide`);

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.isHidden = true;
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function unhideTopic(topicId) {
    try {
      await api.patch(`/topics/${topicId}/unhide`);

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.isHidden = false;
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function blockUser(
    topicId,
    userId,
    reason = "",
    allowedSubtopicsIds = [],
  ) {
    try {
      await api.post(`/moderators/${topicId}/block`, {
        userIdToBlock: userId,
        reason,
        allowedSubtopicsIds,
      });
      await fetchTopicDetails(topicId);
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function unblockUser(topicId, userId) {
    try {
      await api.post(`/moderators/${topicId}/unblock`, {
        userIdToUnblock: userId,
      });
      await fetchTopicDetails(topicId);
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function promoteModerator(topicId, userId) {
    try {
      await api.post(`/moderators/${topicId}/moderators`, {
        userIdToPromote: userId,
      });
      await fetchTopicDetails(topicId);
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function revokeModerator(topicId, userId) {
    try {
      await api.post(`/moderators/${topicId}/moderators/revoke`, {
        userIdToTake: userId,
      });
      await fetchTopicDetails(topicId);
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function toggleTopicClosed(topicId, isCurrentlyClosed) {
    try {
      if (isCurrentlyClosed) {
        await openTopic(topicId);
      } else {
        await closeTopic(topicId);
      }

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.isClosed = !isCurrentlyClosed;
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function toggleTopicHidden(topicId, isCurrentlyHidden) {
    try {
      if (isCurrentlyHidden) {
        await unhideTopic(topicId);
      } else {
        await hideTopic(topicId);
      }

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.isHidden = !isCurrentlyHidden;
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  function clearCurrentTopic() {
    currentTopic.value = null;
    subtopics.value = [];
    canPost.value = false;
    canManage.value = false;
    isBlocked.value = false;
    isClosed.value = false;
  }

  return {
    rootTopics,
    currentTopic,
    subtopics,
    canPost,
    canManage,
    isBlocked,
    isClosed,
    loading,
    error,
    pagination,
    searchFilters,

    topicsCount,
    hasMoreTopics,
    isTopicClosed,
    isTopicHidden,
    canManageTopic,
    currentTopicModerators,
    currentTopicBlockedUsers,

    fetchRootTopics,
    setSearchFilters,
    resetSearchFilters,
    fetchTopicDetails,
    createTopic,
    updateTopicMetadata,
    deleteTopic,
    closeTopic,
    openTopic,
    hideTopic,
    unhideTopic,
    toggleTopicClosed,
    toggleTopicHidden,
    blockUser,
    unblockUser,
    promoteModerator,
    revokeModerator,
    clearCurrentTopic,
  };
});
