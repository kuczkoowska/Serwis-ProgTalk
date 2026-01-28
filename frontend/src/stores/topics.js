import { defineStore } from "pinia";
import axios from "axios";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useTopicsStore = defineStore("topics", {
  state: () => ({
    rootTopics: [], // dla strony głównej
    currentTopic: null,
    subtopics: [],
    canPost: false,
    canManage: false,
    loading: false,
    error: null,
  }),

  getters: {
    // Sprawdza czy użytkownik jest moderatorem lub creatorem tematu
    canManageTopic: (state) => (userId) => {
      if (!state.currentTopic || !userId) return false;

      if (state.currentTopic.creator._id === userId) {
        return true;
      }

      return (
        state.currentTopic.moderators?.some((mod) => mod.user === userId) ||
        false
      );
    },
  },

  actions: {
    async fetchRootTopics() {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get("/api/topics?root=true");
        this.rootTopics = res.data.data.topics;
      } catch (err) {
        this.error = "Błąd pobierania tematów.";
      } finally {
        this.loading = false;
      }
    },

    async fetchTopicDetails(id) {
      this.loading = true;
      this.currentTopic = null;
      this.subtopics = [];

      try {
        const res = await axios.get(`/api/topics/${id}`);
        this.currentTopic = res.data.data.topic;
        this.subtopics = res.data.data.subtopics;
        this.canPost = res.data.data.canPost;
        this.canManage = res.data.data.canManage;
      } catch (err) {
        this.error = "Nie udało się pobrać tematu.";
      } finally {
        this.loading = false;
      }
    },

    async createTopic(payload) {
      try {
        await axios.post("/api/topics", payload);

        if (payload.parentId) {
          await this.fetchTopicDetails(payload.parentId);
        } else {
          await this.fetchRootTopics();
        }
        return true;
      } catch (err) {
        throw getError(err);
      }
    },

    async toggleTopicClosed(topicId) {
      try {
        const isClosed = this.currentTopic?.isClosed;
        const endpoint = isClosed ? "open" : "close";

        await axios.patch(`/api/topics/${topicId}/${endpoint}`);

        await this.fetchTopicDetails(topicId);
        return true;
      } catch (err) {
        throw getError(err);
      }
    },

    async toggleTopicHidden(topicId) {
      try {
        const isHidden = this.currentTopic?.isHidden;
        const endpoint = isHidden ? "unhide" : "hide";

        await axios.patch(`/api/topics/${topicId}/${endpoint}`);

        await this.fetchTopicDetails(topicId);
        return true;
      } catch (err) {
        throw getError(err);
      }
    },

    async blockUser(topicId, userId, reason = "", allowedSubtopicsIds = []) {
      try {
        await axios.post(`/api/topics/${topicId}/block`, {
          userIdToBlock: userId,
          reason,
          allowedSubtopicsIds,
        });

        await this.fetchTopicDetails(topicId);
        return true;
      } catch (err) {
        throw getError(err);
      }
    },

    async unblockUser(topicId, userId) {
      try {
        await axios.post(`/api/topics/${topicId}/unblock`, {
          userIdToUnblock: userId,
        });

        await this.fetchTopicDetails(topicId);
        return true;
      } catch (err) {
        throw getError(err);
      }
    },

    async promoteModerator(topicId, userId) {
      try {
        await axios.post(`/api/topics/${topicId}/moderators`, {
          userIdToPromote: userId,
        });

        await this.fetchTopicDetails(topicId);
        return true;
      } catch (err) {
        throw getError(err);
      }
    },

    async revokeModerator(topicId, userId) {
      try {
        await axios.post(`/api/topics/${topicId}/moderators/revoke`, {
          userIdToTake: userId,
        });

        await this.fetchTopicDetails(topicId);
        return true;
      } catch (err) {
        throw getError(err);
      }
    },
  },
});
