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
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${this.token}`;
        }

        console.log("Zalogowano:", this.user?.username || this.user?.email);

        return true;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Błąd logowania";
        console.error("Błąd logowania:", msg);
        throw msg;
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
  },
});
