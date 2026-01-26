import { createApp } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth";
import App from "./App.vue";
import router from "./router.js";

import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primevue/themes";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import "primeicons/primeicons.css";

import "highlight.js/styles/atom-one-dark.css";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import hljsVuePlugin from "@highlightjs/vue-plugin";
import axios from "axios";

import "./assets/main.css";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);

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

app.use(PrimeVue, {
  theme: {
    preset: MyPinkPreset,
    options: {
      darkModeSelector: ".app-dark",
    },
  },
});
app.use(createPinia());
app.use(router);
app.use(hljsVuePlugin);
app.use(ToastService);

const authStore = useAuthStore();
authStore.restore();

const token = localStorage.getItem("token");

if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

app.mount("#app");
