import { defineStore } from "pinia";
import axios from "axios";

const getError = (err) => err.response?.data?.message || "Błąd operacji";

export const usePostsStore = defineStore("posts", {
  state: () => ({
    posts: [],
    loading: false,
    error: null,

    pagination: {
      page: 1,
      totalPages: 1,
      totalPosts: 0,
    },
  }),

  actions: {
    async fetchPosts(topicId, page = 1, limit = 10) {
      this.loading = true;
      this.error = null;

      try {
        const res = await axios.get(`/api/posts/topic/${topicId}`, {
          params: { page, limit },
        });

        this.posts = res.data.data.posts;

        const { currentPage, totalPages, totalPosts } = res.data;
        this.pagination = { page: currentPage, totalPages, totalPosts };
      } catch (err) {
        this.error = "Nie udało się pobrać wpisów.";
      } finally {
        this.loading = false;
      }
    },

    async addPost(topicId, content, replyTo = null, tags = []) {
      try {
        const { data } = await axios.post("/api/posts", {
          content,
          topicId,
          replyTo,
          tags,
        });
        return data;
      } catch (err) {
        throw getError(err);
      }
    },

    async toggleLike(postId) {
      try {
        const { data } = await axios.patch(`/api/posts/${postId}/like`);

        const post = this.posts.find((p) => p._id === postId);
        if (post && data.data?.post?.likes) {
          post.likes = data.data.post.likes;
        }
        return data;
      } catch (err) {
        throw getError(err);
      }
    },

    async deletePost(postId) {
      try {
        const res = await axios.delete(`/api/posts/${postId}`);
        return res.data;
      } catch (err) {
        throw getError(err);
      }
    },
  },
});
