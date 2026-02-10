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
  });

  const waitingForOwnPost = ref(false);
  const ownPostId = ref(null);

  const currentPage = computed(() => pagination.value.page);

  async function fetchPosts(topicId, page = 1, limit = 10) {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.get(`/posts/topic/${topicId}`, {
        params: { page, limit },
      });

      posts.value = res.data.data.posts;

      pagination.value = {
        page: page,
        limit: limit,
        hasNextPage: res.data.data.hasNextPage || false,
      };
    } catch (err) {
      error.value = "Nie udało się pobrać wpisów.";
      console.error(err);
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
      handleNewPost(data.data.post);

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
      // Aktualizuj lokalnie
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
      const res = await api.delete(`/posts/${postId}`);
      posts.value = posts.value.filter((p) => p._id !== postId);
      return res.data;
    } catch (err) {
      throw getError(err);
    }
  }

  async function updatePost(postId, content) {
    try {
      const { data } = await api.patch(`/posts/${postId}`, { content });
      const postIndex = posts.value.findIndex((p) => p._id === postId);
      if (postIndex !== -1 && data.data?.post) {
        posts.value[postIndex] = data.data.post;
      }
      return data;
    } catch (err) {
      throw getError(err);
    }
  }

  function clearPosts() {
    posts.value = [];
    pagination.value = { page: 1, limit: 10, hasNextPage: false };
    waitingForOwnPost.value = false;
  }

  const handleNewPost = (post) => {
    const exists = posts.value.find((p) => p._id === post._id);
    if (!exists) {
      posts.value.push(post);
    }
  };

  function initPostSockets() {
    socketService.on("new_post", (data) => {
      handleNewPost(data.post);
    });

    socketService.on("post_liked", (data) => {
      const post = posts.value.find((p) => p._id === data.postId);
      if (post) {
        post.likesCount = data.likesCount;
      }
    });

    socketService.on("post_deleted", (data) => {
      posts.value = posts.value.filter((p) => p._id !== data.postId);
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
    ownPostId,
    currentPage,

    fetchPosts,
    addPost,
    toggleLike,
    deletePost,
    updatePost,
    clearPosts,

    initPostSockets,
    cleanupPostSockets,
  };
});
