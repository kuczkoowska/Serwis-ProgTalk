import { defineStore } from "pinia";
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

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: getUserFromLocalStorage(),
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    async login(identifier, password) {
      try {
        const payload = {
          [identifier.includes("@") ? "email" : "username"]: identifier,
          password,
        };

        const { data } = await api.post("/auth/login", payload);

        this.setAuth(data.token, data.data.user);
        return true;
      } catch (error) {
        throw getError(error);
      }
    },

    async register(payload) {
      try {
        await api.post("/auth/register", payload);
        return true;
      } catch (error) {
        throw getError(error);
      }
    },

    logout() {
      this.setAuth(null, null);
      router.push("/login");
    },

    restore() {
      if (this.token && this.user) {
        socketService.io.io.opts.query = {
          userId: this.user._id,
          role: this.user.role,
        };
        socketService.connect();
      }
    },

    setAuth(token, user) {
      this.token = token;
      this.user = user;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        if (user) {
          socketService.io.io.opts.query = {
            userId: user._id,
            role: user.role,
          };
          socketService.connect();
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        socketService.disconnect();
      }
    },
  },
});
