import { defineStore } from "pinia";
import axios from "axios";

export const useTopicsStore = defineStore("topics", {
  state: () => ({
    rootTopics: [], // dla strony głównej
    currentTopic: null,
    subtopics: [],
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
        state.currentTopic.moderators?.some((mod) => mod.user._id === userId) ||
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
        console.error(err);
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
        throw err.response?.data?.message || "Błąd tworzenia tematu";
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
        throw err.response?.data?.message || "Błąd zmiany statusu tematu";
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
        throw err.response?.data?.message || "Błąd blokowania użytkownika";
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
        throw err.response?.data?.message || "Błąd odblokowania użytkownika";
      }
    },
  },
});
