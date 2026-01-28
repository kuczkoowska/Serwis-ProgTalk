import { defineStore } from "pinia";
import router from "../router";
import axios from "axios";
const getError = (err) => err.response?.data?.message || "Błąd autoryzacji";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    async login(identifier, password) {
      try {
        const payload = {
          [identifier.includes("@") ? "email" : "username"]: identifier,
          password,
        };

        const { data } = await axios.post("/api/auth/login", payload);

        this.setAuth(data.token, data.data.user);
        return true;
      } catch (error) {
        throw getError(error);
      }
    },

    async register(payload) {
      try {
        await axios.post("/api/auth/register", payload);
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
      if (this.token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      }
    },

    setAuth(token, user) {
      this.token = token;
      this.user = user;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
      }
    },

    async updateProfile(bio, username) {
      try {
        const { data } = await axios.patch("/api/users/profile", {
          bio,
          username,
        });

        this.user = { ...this.user, ...data.data.user };
        localStorage.setItem("user", JSON.stringify(this.user));

        return true;
      } catch (error) {
        throw getError(error);
      }
    },

    async updatePassword(currentPassword, newPassword, newPasswordConfirm) {
      try {
        const { data } = await axios.patch("/api/users/update-password", {
          currentPassword,
          newPassword,
          newPasswordConfirm,
        });

        if (data.token) {
          this.setAuth(data.token, this.user);
        }

        return true;
      } catch (error) {
        throw getError(error);
      }
    },
  },
});
