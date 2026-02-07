import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const useTagsStore = defineStore("tags", () => {
  const allTags = ref([]);
  const topicTags = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const tagsCount = computed(() => allTags.value.length);
  const sortedTags = computed(() =>
    [...allTags.value].sort((a, b) => a.name.localeCompare(b.name)),
  );
  const popularTags = computed(() =>
    [...allTags.value].sort((a, b) => b.usageCount - a.usageCount).slice(0, 10),
  );

  async function fetchTags() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/tags");
      allTags.value = res.data.data.tags;
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
      topicTags.value = res.data.data.tags;
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
      allTags.value = allTags.value.filter((t) => t._id !== tagId);
      topicTags.value = topicTags.value.filter((t) => t._id !== tagId);
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
    allTags.value = [];
    topicTags.value = [];
  }

  return {
    allTags,
    topicTags,
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
