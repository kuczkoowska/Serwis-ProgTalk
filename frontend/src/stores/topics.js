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

  actions: {
    async fetchRootTopics() {
      this.loading = true;
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
      payload = { name, description, parentId };
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
  },
});
