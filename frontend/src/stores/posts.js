import { defineStore } from "pinia";
import axios from "axios";

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

    async addPost(topicId, content) {
      try {
        await axios.post("/api/posts", {
          content,
          topicId,
          tags: [],
        });

        await this.fetchPosts(topicId, this.pagination.page);

        return true;
      } catch (err) {
        throw err.response?.data?.message || "Błąd dodawania wpisu";
      }
    },
    async toggleLike(postId) {
      const authStore = useAuthStore();
      const userId = authStore.user?._id;

      if (!userId) return;

      try {
        const res = await axios.patch(`/api/posts/${postId}/like`);

        const postIndex = this.posts.findIndex((p) => p._id === postId);
        if (postIndex !== -1) {
          const post = this.posts[postIndex];
          const isLiked = post.likes.includes(userId);

          if (isLiked) {
            post.likes = post.likes.filter((id) => id !== userId);
          } else {
            post.likes.push(userId);
          }
        }
      } catch (err) {
        console.error("Błąd lajkowania:", err);
      }
    },
  },
});
