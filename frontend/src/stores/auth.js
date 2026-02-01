import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "../router";
import socketService from "../plugins/socket";
import api from "../plugins/axios";

const getError = (err) => err.response?.data?.message || "Błąd autoryzacji";

function getUserFromLocalStorage() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    localStorage.removeItem("user");
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref(getUserFromLocalStorage());
  const token = ref(localStorage.getItem("token") || null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const userId = computed(() => user.value?._id);
  const username = computed(() => user.value?.username || "");

  const login = async (identifier, password) => {
    try {
      const payload = {
        [identifier.includes("@") ? "email" : "username"]: identifier,
        password,
      };

      const { data } = await api.post("/auth/login", payload);

      setAuth(data.token, data.data.user);
      return true;
    } catch (error) {
      throw getError(error);
    }
  };

  const register = async (payload) => {
    try {
      await api.post("/auth/register", payload);
      return true;
    } catch (error) {
      throw getError(error);
    }
  };

  const logout = () => {
    setAuth(null, null);
    router.push("/login");
  };

  const restore = () => {
    if (token.value && user.value) {
      socketService.connect();
    }
  };

  const setAuth = (newToken, newUser) => {
    token.value = newToken;
    user.value = newUser;

    if (newToken) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      if (newUser) {
        socketService.connect();
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      socketService.disconnect();
    }
  };

  return {
    user,
    token,

    isAuthenticated,
    isAdmin,
    userId,
    username,

    login,
    register,
    logout,
    restore,
    setAuth,
  };
});
