import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../plugins/axios";
import socketService from "../plugins/socket";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const usePostsStore = defineStore("posts", () => {
  const posts = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const pagination = ref({
    page: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
    totalPages: 1,
    totalItems: 0,
  });

  const waitingForOwnPost = ref(false);
  const isLastPage = computed(() => !pagination.value.hasNextPage);

  async function fetchPosts(topicId, page = 1, limit = 10) {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.get(`/posts/topic/${topicId}`, {
        params: { page, limit },
      });

      posts.value = res.data.data.posts;
      const backendPag = res.data.data.pagination || {};

      pagination.value = {
        page: page,
        limit: limit,
        hasNextPage: backendPag.hasNextPage || false,
        hasPrevPage: page > 1,
        totalPages: backendPag.totalPages || 1,
        totalItems: backendPag.totalItems || 0,
      };
    } catch (err) {
      error.value = "Nie udało się pobrać wpisów.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchLastPage(topicId) {
    const targetPage =
      pagination.value.totalPages > 0 ? pagination.value.totalPages : 1;
    await fetchPosts(topicId, targetPage, pagination.value.limit);
  }

  async function loadPageWithPost(postId) {
    loading.value = true;
    try {
      const { data } = await api.get(`/posts/${postId}/page`, {
        params: { limit: pagination.value.limit },
      });

      const targetPage = data.data.page;
      const topicId = data.data.topicId;

      if (targetPage !== pagination.value.page) {
        await fetchPosts(topicId, targetPage, pagination.value.limit);
      }

      return true;
    } catch (err) {
      console.error("Nie udało się znaleźć strony posta:", err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function addPost(topicId, content, replyTo = null, tags = []) {
    waitingForOwnPost.value = true;
    try {
      const { data } = await api.post("/posts", {
        content,
        topicId,
        tags,
        replyTo,
      });
      return data.data;
    } catch (err) {
      throw getError(err);
    } finally {
      waitingForOwnPost.value = false;
    }
  }

  async function toggleLike(postId) {
    try {
      const { data } = await api.patch(`/posts/${postId}/like`);
      const updatedPost = data.data?.post;
      const postIndex = posts.value.findIndex((p) => p._id === postId);
      if (postIndex !== -1 && updatedPost) {
        posts.value[postIndex].likes = updatedPost.likes;
      }
      return data;
    } catch (err) {
      throw getError(err);
    }
  }

  async function deletePost(postId) {
    try {
      await api.delete(`/posts/${postId}`);
      const post = posts.value.find((p) => p._id === postId);
      if (post) post.isDeleted = true;
      return true;
    } catch (err) {
      throw getError(err);
    }
  }

  function clearPosts() {
    posts.value = [];
    pagination.value = {
      page: 1,
      limit: 10,
      hasNextPage: false,
      hasPrevPage: false,
      totalPages: 1,
      totalItems: 0,
    };
    waitingForOwnPost.value = false;
  }

  const handleNewPost = (post) => {
    pagination.value.totalItems++;

    const newTotalPages = Math.ceil(
      pagination.value.totalItems / pagination.value.limit,
    );
    pagination.value.totalPages = newTotalPages || 1;

    pagination.value.hasNextPage =
      pagination.value.page < pagination.value.totalPages;

    if (posts.value.length < pagination.value.limit) {
      if (pagination.value.page === pagination.value.totalPages) {
        const exists = posts.value.find((p) => p._id === post._id);
        if (!exists) posts.value.push(post);
      }
    }
  };

  function initPostSockets() {
    socketService.on("new_post", (data) => handleNewPost(data.post));

    socketService.on("post_liked", (data) => {
      const post = posts.value.find((p) => p._id === data.postId);
      if (post) post.likesCount = data.likesCount;
    });

    socketService.on("post_deleted", (data) => {
      const post = posts.value.find((p) => p._id === data.postId);
      if (post) post.isDeleted = true;
    });
  }

  function cleanupPostSockets() {
    socketService.off("new_post");
    socketService.off("post_liked");
    socketService.off("post_deleted");
  }

  return {
    posts,
    loading,
    error,
    pagination,
    waitingForOwnPost,
    isLastPage,

    fetchPosts,
    fetchLastPage,
    loadPageWithPost,
    addPost,
    toggleLike,
    deletePost,
    clearPosts,

    initPostSockets,
    cleanupPostSockets,
  };
});
