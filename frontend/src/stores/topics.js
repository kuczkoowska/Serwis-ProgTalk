import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";
import socketService from "../plugins/socket";
import { useAuthStore } from "./auth";
import router from "../router";

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

  function canManageTopic(userId) {
    if (!currentTopic.value || !userId) return false;
    const creatorId =
      currentTopic.value.creator?._id || currentTopic.value.creator;
    if (creatorId === userId) return true;
    return (
      currentTopic.value.moderators?.some((mod) => {
        const modId = mod.user?._id || mod.user;
        return modId === userId;
      }) || false
    );
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

  async function fetchRootTopics(customFilters = {}) {
    loading.value = true;
    error.value = null;
    if (customFilters) setSearchFilters(customFilters);

    try {
      const params = {
        page: searchFilters.value.page || pagination.value.currentPage,
        limit: pagination.value.limit,
        search: searchFilters.value.search,
        sort: searchFilters.value.sort,
        root: !searchFilters.value.showAllLevels ? "true" : undefined,
      };

      const res = await api.get("/topics", { params });
      rootTopics.value = res.data.data.topics;

      if (res.data.data.pagination) {
        const backendPag = res.data.data.pagination;
        pagination.value = {
          currentPage: backendPag.currentPage || params.page,
          limit: backendPag.limit,
          hasNextPage: backendPag.hasNextPage,
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

    if (currentTopic.value?._id !== id) {
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
      if (err.response?.status === 404)
        error.value = "Temat nie został znaleziony.";
      else if (err.response?.status === 403)
        error.value = "Brak dostępu do tego tematu.";
      else error.value = "Nie udało się pobrać tematu.";
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
      if (currentTopic.value?._id === topicId)
        currentTopic.value.description = description;
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
      return true;
    } catch (err) {
      throw getError(err);
    }
  }
  async function openTopic(topicId, includeSubtopics = false) {
    try {
      await api.patch(`/topics/${topicId}/open`, { includeSubtopics });
      return true;
    } catch (err) {
      throw getError(err);
    }
  }
  async function hideTopic(topicId) {
    try {
      await api.patch(`/topics/${topicId}/hide`);
      return true;
    } catch (err) {
      throw getError(err);
    }
  }
  async function unhideTopic(topicId) {
    try {
      await api.patch(`/topics/${topicId}/unhide`);
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
    return isCurrentlyClosed
      ? openTopic(topicId, includeSubtopics)
      : closeTopic(topicId, includeSubtopics);
  }
  async function toggleTopicHidden(topicId, isCurrentlyHidden) {
    return isCurrentlyHidden ? unhideTopic(topicId) : hideTopic(topicId);
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

  function subscribeToTopicsList() {
    const authStore = useAuthStore();
    socketService.joinTopicsList();
    socketService.on("new_topic", (data) => {
      const creatorName = data.topic?.creator?.username || data.topic?.creator;
      if (creatorName !== authStore.user?.username) {
        hasNewTopics.value = true;
      }
    });
  }

  function unsubscribeFromTopicsList() {
    socketService.leaveTopicsList();
    socketService.off("new_topic");
    hasNewTopics.value = false;
  }

  function initTopicSockets(topicId) {
    const authStore = useAuthStore();
    const myId = authStore.user?._id;

    socketService.joinTopic(topicId);

    socketService.on("new_subtopic", (data) => {
      if (!subtopics.value.some((s) => s._id === data.topic._id)) {
        subtopics.value.push(data.topic);
      }
    });

    socketService.on("topic_closed", (data) => {
      if (currentTopic.value && currentTopic.value._id === data.topicId) {
        currentTopic.value.isClosed = true;
        isClosed.value = true;
        if (!canManage.value) canPost.value = false;
      }
      const sub = subtopics.value.find((s) => s._id === data.topicId);
      if (sub) sub.isClosed = true;
    });

    socketService.on("topic_opened", (data) => {
      if (currentTopic.value && currentTopic.value._id === data.topicId) {
        currentTopic.value.isClosed = false;
        isClosed.value = false;
        if (!isBlocked.value) canPost.value = true;
      }
      const sub = subtopics.value.find((s) => s._id === data.topicId);
      if (sub) sub.isClosed = false;
    });

    socketService.on("topic_hidden", (data) => {
      if (currentTopic.value && currentTopic.value._id === data.topicId) {
        currentTopic.value.isHidden = true;
        if (authStore.user?.role !== "admin") {
          router.push("/");
        }
      }
    });

    socketService.on("topic_unhidden", (data) => {
      if (currentTopic.value && currentTopic.value._id === data.topicId) {
        currentTopic.value.isHidden = false;
      }
    });

    socketService.on("user_blocked_in_topic", (data) => {
      if (data.userId === myId && data.topicId === currentTopic.value?._id) {
        isBlocked.value = true;
        canPost.value = false;
      }
    });

    socketService.on("user_unblocked_in_topic", (data) => {
      if (data.userId === myId && data.topicId === currentTopic.value?._id) {
        isBlocked.value = false;
        if (!isClosed.value) canPost.value = true;
      }
    });

    const refreshPermissions = async (data) => {
      if (data.topicId === currentTopic.value?._id) {
        await fetchTopicDetails(data.topicId);
      }
    };
    socketService.on("moderator_added", refreshPermissions);
    socketService.on("moderator_removed", refreshPermissions);
  }

  function cleanupTopicSockets(topicId) {
    if (topicId) socketService.leaveTopic(topicId);
    socketService.off("new_subtopic");
    socketService.off("topic_closed");
    socketService.off("topic_opened");
    socketService.off("topic_hidden");
    socketService.off("topic_unhidden");
    socketService.off("user_blocked_in_topic");
    socketService.off("user_unblocked_in_topic");
    socketService.off("moderator_added");
    socketService.off("moderator_removed");
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
    subscribeToTopicsList,
    unsubscribeFromTopicsList,
    initTopicSockets,
    cleanupTopicSockets,
  };
});
