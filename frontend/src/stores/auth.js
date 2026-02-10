import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "../router";
import socketService from "../plugins/socket";
import api from "../plugins/axios"; // Upewnij się, że to importuje Twoją instancję axios

const getError = (err) =>
  err.response?.data?.message || err.message || "Wystąpił nieoczekiwany błąd";

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

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const isActive = computed(() => user.value?.isActive);
  const userId = computed(() => user.value?._id);
  const username = computed(() => user.value?.username || "");

  const setAuth = (newToken, newUser) => {
    token.value = newToken;
    user.value = newUser;

    if (newToken) {
      localStorage.setItem("token", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
        socketService.connect(newToken);
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      socketService.disconnect();
    }
  };

  const login = async ({ identifier, password }) => {
    try {
      const payload = {
        email: identifier.includes("@") ? identifier : undefined,
        username: !identifier.includes("@") ? identifier : undefined,
        password,
      };

      const response = await api.post("/auth/login", payload);
      const { token: newToken, data, message } = response.data;

      setAuth(newToken, data.user);

      return { success: true, message };
    } catch (error) {
      throw getError(error);
    }
  };

  const register = async (payload) => {
    try {
      const response = await api.post("/auth/register", payload);
      return { success: true, message: response.data.message };
    } catch (error) {
      throw getError(error);
    }
  };

  const logout = () => {
    setAuth(null, null);
    router.push("/login");
  };

  const fetchUser = async () => {
    if (!token.value) return;
    try {
      user.value = response.data.data.user;
      localStorage.setItem("user", JSON.stringify(user.value));
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const restore = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      token.value = storedToken;

      socketService.connect(storedToken);

      fetchUser();
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isActive,
    userId,
    username,
    login,
    register,
    logout,
    restore,
    fetchUser,
    setAuth,
  };
});
