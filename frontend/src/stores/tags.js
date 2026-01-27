import { defineStore } from "pinia";
import axios from "axios";

export const useTagsStore = defineStore("tags", {
  state: () => ({
    tags: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTagsForTopic(topicId) {
      this.loading = true;
      this.error = null;

      try {
        const res = await axios.get(`/api/tags/topic/${topicId}`);
        this.tags = res.data.data.tags;
      } catch (err) {
        this.error = "Nie udało się pobrać tagów.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async createTag(topicId, name, color) {
      try {
        const res = await axios.post("/api/tags", {
          topicId,
          name,
          color,
        });
        await this.fetchTagsForTopic(topicId);
        return res.data;
      } catch (err) {
        console.error(
          "Błąd tworzenia tagu:",
          err.response?.data || err.message || err,
        );
        throw err.response?.data?.message || "Błąd tworzenia tagu";
      }
    },

    async deleteTag(tagId, topicId) {
      try {
        await axios.delete(`/api/tags/${tagId}`);
        await this.fetchTagsForTopic(topicId);
      } catch (err) {
        console.error(
          "Błąd usuwania tagu:",
          err.response?.data || err.message || err,
        );
        throw err.response?.data?.message || "Błąd usuwania tagu";
      }
    },
  },
});
