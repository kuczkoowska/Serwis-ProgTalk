import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primevue/themes";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./assets/main.css";

import hljsVuePlugin from "@highlightjs/vue-plugin";
import "./plugins/highlight";

import socketService from "./plugins/socket";

import { useAuthStore } from "./stores/auth";

const MyPinkPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{pink.50}",
      100: "{pink.100}",
      200: "{pink.200}",
      300: "{pink.300}",
      400: "{pink.400}",
      500: "{pink.500}",
      600: "{pink.600}",
      700: "{pink.700}",
      800: "{pink.800}",
      900: "{pink.900}",
      950: "{pink.950}",
    },
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const authStore = useAuthStore();
authStore.restore();

app.use(PrimeVue, {
  theme: {
    preset: MyPinkPreset,
    options: {
      darkModeSelector: ".app-dark",
    },
  },
});
app.use(ToastService);
app.use(hljsVuePlugin);

app.provide("socket", socketService);

app.mount("#app");
