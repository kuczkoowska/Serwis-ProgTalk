import { defineStore } from "pinia";
import axios from "axios";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

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
        throw getError(err);
      }
    },

    async deleteTag(tagId, topicId) {
      try {
        await axios.delete(`/api/tags/${tagId}`);
        await this.fetchTagsForTopic(topicId);
      } catch (err) {
        throw getError(err);
      }
    },
  },
});
