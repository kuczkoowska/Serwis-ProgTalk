import { defineStore } from "pinia";
import router from "../router";
import axios from "axios";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    async login(identifier, password) {
      try {
        const payload = emailRegex.test(identifier)
          ? { email: identifier, password }
          : { username: identifier, password };

        const response = await axios.post("/api/auth/login", payload);

        this.token = response.data.token;
        this.user = response.data?.data?.user;

        if (this.token) {
          localStorage.setItem("token", this.token);
          if (this.user)
            localStorage.setItem("user", JSON.stringify(this.user));
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${this.token}`;
        }
        return true;
      } catch (error) {
        throw error.response?.data?.message || "Błąd logowania";
      }
    },

    async register(payload) {
      try {
        await axios.post("/api/auth/register", payload);
        return true;
      } catch (error) {
        throw error.response?.data?.message || "Błąd rejestracji";
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      router.push("/login");
    },

    restore() {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token) {
        this.token = token;
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (e) {
          this.user = null;
        }
      }
    },
  },
});
