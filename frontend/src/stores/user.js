import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";
import api from "../plugins/axios";
import socketService from "../plugins/socket"; // Dodajemy sockety

const getError = (err) => {
  return err.response?.data?.message || err.message || "Błąd operacji";
};

export const useUserStore = defineStore("user", () => {
  const profile = ref(null);
  const stats = ref({
    topics: 0,
    posts: 0,
    likes: 0,
  });
  const searchResults = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchMyProfile() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get("/users/profile");

      profile.value = data.data.user;
      stats.value = data.data.stats;
    } catch (err) {
      error.value = "Nie udało się pobrać profilu.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserProfile(userId) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get(`/users/${userId}`);
      return data.data;
    } catch (err) {
      error.value = "Nie udało się pobrać profilu użytkownika.";
      console.error(err);
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(bio, username) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch("/users/profile", {
        bio,
        username,
      });

      profile.value = { ...profile.value, ...data.data.user };

      const authStore = useAuthStore();
      if (authStore.user) {
        authStore.user.username = data.data.user.username;
        authStore.user.bio = data.data.user.bio;
        localStorage.setItem("user", JSON.stringify(authStore.user));
      }

      return { success: true, message: data.message };
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function updatePassword(
    currentPassword,
    newPassword,
    newPasswordConfirm,
  ) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch("/users/update-password", {
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });

      if (data.token) {
        const authStore = useAuthStore();
        authStore.setAuth(data.token, authStore.user);
      }

      return { success: true, message: data.message };
    } catch (err) {
      throw getError(err);
    } finally {
      loading.value = false;
    }
  }

  async function searchUsers(query) {
    if (!query) {
      searchResults.value = [];
      return;
    }

    loading.value = true;
    try {
      const { data } = await api.get(`/users/search?query=${query}`);
      searchResults.value = data.data.users;
    } catch (err) {
      console.error("Błąd wyszukiwania:", err);
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function saveLastViewedPage(topicId, page) {
    try {
      await api.post("/users/last-viewed-page", {
        topicId,
        page,
      });
    } catch (err) {
      console.warn("Błąd zapisu ostatniej strony:", err);
    }
  }

  async function getLastViewedPage(topicId) {
    try {
      const { data } = await api.get(`/users/last-viewed-page/${topicId}`);
      return data.data.page;
    } catch (err) {
      return 1;
    }
  }

  function clearProfile() {
    profile.value = null;
    stats.value = {
      topics: 0,
      posts: 0,
      likes: 0,
    };
    error.value = null;
  }

  // sockets

  function initUserSockets() {
    const authStore = useAuthStore();

    socketService.on("user_blocked_globally", (data) => {
      if (authStore.user && authStore.user._id === data.userId) {
        alert(data.message || "Twoje konto zostało zablokowane.");
        authStore.logout();
      }
    });
  }

  return {
    profile,
    stats,
    searchResults,
    loading,
    error,

    fetchMyProfile,
    fetchUserProfile,
    updateProfile,
    updatePassword,
    searchUsers,
    saveLastViewedPage,
    getLastViewedPage,
    clearProfile,
    initUserSockets,
  };
});
