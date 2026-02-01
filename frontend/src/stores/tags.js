import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useTagsStore = defineStore("tags", () => {
  const tags = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const tagsCount = computed(() => tags.value.length);
  const sortedTags = computed(() =>
    [...tags.value].sort((a, b) => a.name.localeCompare(b.name)),
  );
  const popularTags = computed(() =>
    [...tags.value].sort((a, b) => b.usageCount - a.usageCount).slice(0, 10),
  );

  async function fetchTags() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/tags");
      tags.value = res.data.data.tags;
    } catch (err) {
      error.value = "Nie udało się pobrać tagów.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchTagsForTopic(topicId) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/tags/topic/${topicId}`);
      tags.value = res.data.data.tags;
    } catch (err) {
      error.value = "Nie udało się pobrać tagów tematu.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function createTag(name) {
    try {
      const res = await api.post("/tags", { name });
      await fetchTags();
      return res.data;
    } catch (err) {
      throw getError(err);
    }
  }

  async function deleteTag(tagId) {
    try {
      await api.delete(`/tags/${tagId}`);
      tags.value = tags.value.filter((t) => t._id !== tagId);
    } catch (err) {
      throw getError(err);
    }
  }

  async function assignTagToTopic(topicId, tagId) {
    try {
      await api.post("/tags/assign", { topicId, tagId });
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  async function removeTagFromTopic(topicId, tagId) {
    try {
      await api.post("/tags/remove", { topicId, tagId });
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  function clearTags() {
    tags.value = [];
  }

  return {
    tags,
    loading,
    error,

    tagsCount,
    sortedTags,
    popularTags,

    fetchTags,
    fetchTagsForTopic,
    createTag,
    deleteTag,
    assignTagToTopic,
    removeTagFromTopic,
    clearTags,
  };
});
