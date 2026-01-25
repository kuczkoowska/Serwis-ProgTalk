import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    async login(email, password) {
      try {
        const response = await axios.post("/api/auth/login", {
          email,
          password,
        });

        this.token = response.data.token;
        this.user = response.data.data.user;

        localStorage.setItem("token", this.token);

        // domyślny nagłówek dla przyszłych zapytań
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        console.log("Zalogowano:", this.user.username);

        return true;
      } catch (error) {
        console.error("Błąd logowania:", error.response?.data?.message);
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
  },
});
