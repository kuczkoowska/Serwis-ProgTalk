import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "./auth";

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
    async fetchPosts(topicId, page = 1) {
      this.loading = true;
      this.error = null;

      try {
        const res = await axios.get(`/api/posts/topic/${topicId}`, {
          params: { page, limit: 10 },
        });

        this.posts = res.data.data.posts;

        this.pagination = {
          page: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalPosts: res.data.totalPosts,
        };
      } catch (err) {
        this.error = "Nie udało się pobrać wpisów.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async addPost(topicId, content, replyTo = null, tags = []) {
      try {
        const payload = { content, topicId, replyTo, tags };
        const res = await axios.post("/api/posts", payload);
        return res.data;
      } catch (err) {
        console.error(
          "Błąd dodawania postu:",
          err.response?.data || err.message || err,
        );
        throw err.response?.data?.message || "Błąd dodawania postu";
      }
    },

    async toggleLike(postId) {
      try {
        const res = await axios.patch(`/api/posts/${postId}/like`);

        const postIndex = this.posts.findIndex((p) => p._id === postId);
        if (postIndex !== -1) {
          const post = this.posts[postIndex];

          const serverLikes = res?.data?.data?.post?.likes || null;

          if (serverLikes) {
            post.likes = serverLikes;
          }
        }

        return res.data;
      } catch (err) {
        console.error(
          "Błąd lajkowania:",
          err.response?.data || err.message || err,
        );
        throw err.response?.data?.message || "Błąd lajkowania";
      }
    },

    async deletePost(postId) {
      try {
        const res = await axios.delete(`/api/posts/${postId}`);
        return res.data;
      } catch (err) {
        console.error(
          "Błąd usuwania:",
          err.response?.data || err.message || err,
        );
        throw err.response?.data?.message || "Błąd usuwania postu";
      }
    },
  },
});
