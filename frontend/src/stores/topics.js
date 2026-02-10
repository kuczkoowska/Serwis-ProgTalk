import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";
import socketService from "../plugins/socket";
import { useAuthStore } from "./auth";

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
  const hasNewTopics = ref(false);

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

  const hasMoreTopics = computed(() => pagination.value.hasNextPage);
  const topicsCount = computed(() => rootTopics.value.length);

  function updateFilter(key, value) {
    searchFilters.value[key] = value;
  }

  function canManageTopic(userId) {
    if (!currentTopic.value || !userId) return false;

    const creatorId = currentTopic.value.creator?._id;
    if (creatorId === userId) return true;

    return (
      currentTopic.value.moderators?.some((mod) => {
        const modId = mod.user?._id;
        return modId === userId;
      }) || false
    );
  }

  // WEBSOCKETS

  function subscribeToTopicsList() {
    const authStore = useAuthStore();

    socketService.joinTopicsList();

    socketService.on("new_topic", (data) => {
      const creatorName = data.topic?.creator?.username || data.topic?.creator;
      const myName = authStore.user?.username;

      if (creatorName !== myName) {
        hasNewTopics.value = true;
      }
    });
  }

  function unsubscribeFromTopicsList() {
    socketService.leaveTopicsList();
    socketService.off("new_topic");
    hasNewTopics.value = false;
  }

  // http

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

  async function fetchRootTopics(customFilters = {}) {
    loading.value = true;
    error.value = null;

    if (customFilters) {
      searchFilters.value = { ...searchFilters.value, ...customFilters };
    }

    try {
      const params = {
        page: searchFilters.value.page || pagination.value.currentPage,
        limit: pagination.value.limit,
        search: searchFilters.value.search || undefined,
        sort: searchFilters.value.sort || "newest",
        root: !searchFilters.value.showAllLevels ? "true" : undefined,
      };

      const res = await api.get("/topics", { params });

      rootTopics.value = res.data.data.topics;

      if (res.data.data.pagination) {
        const backendPag = res.data.data.pagination;
        pagination.value = {
          currentPage: backendPag.currentPage || params.page,
          limit: backendPag.limit || 12,
          hasNextPage: backendPag.hasNextPage || false,
        };
      }

      hasNewTopics.value = false;
    } catch (err) {
      error.value = "Błąd pobierania tematów.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchTopicDetails(id) {
    loading.value = true;
    error.value = null;

    const isNewTopic = currentTopic.value?._id !== id;
    if (isNewTopic) {
      currentTopic.value = null;
      subtopics.value = [];
    }

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
      if (err.response?.status === 404) {
        error.value = "Temat nie został znaleziony.";
      } else if (err.response?.status === 403) {
        error.value = "Brak dostępu do tego tematu.";
      } else {
        error.value = "Nie udało się pobrać tematu.";
      }
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function createTopic(payload) {
    try {
      const res = await api.post("/topics", payload);
      await fetchRootTopics({ page: 1 });
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

  async function closeTopic(topicId, includeSubtopics = false) {
    try {
      await api.patch(`/topics/${topicId}/close`, { includeSubtopics });

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.isClosed = true;
        isClosed.value = true;
        canPost.value = false;
      }

      if (includeSubtopics) {
        subtopics.value = subtopics.value.map((s) => ({
          ...s,
          isClosed: true,
        }));
      }

      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function openTopic(topicId, includeSubtopics = false) {
    try {
      await api.patch(`/topics/${topicId}/open`, { includeSubtopics });

      if (currentTopic.value && currentTopic.value._id === topicId) {
        currentTopic.value.isClosed = false;
        isClosed.value = false;
      }

      if (includeSubtopics) {
        subtopics.value = subtopics.value.map((s) => ({
          ...s,
          isClosed: false,
        }));
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
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function toggleTopicClosed(
    topicId,
    isCurrentlyClosed,
    includeSubtopics = false,
  ) {
    try {
      if (isCurrentlyClosed) {
        await openTopic(topicId, includeSubtopics);
      } else {
        await closeTopic(topicId, includeSubtopics);
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
    hasNewTopics,

    topicsCount,
    hasMoreTopics,
    canManageTopic,

    updateFilter,

    fetchRootTopics,
    subscribeToTopicsList,
    unsubscribeFromTopicsList,
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
