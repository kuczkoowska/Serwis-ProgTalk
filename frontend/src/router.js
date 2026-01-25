import { createRouter, createWebHistory } from "vue-router";
import LoginView from "./views/auth/LoginView.vue";
import RegisterView from "./views/auth/RegisterView.vue";
import TopicListView from "./views/topics/TopicListView.vue";

const routes = [
  { path: "/login", component: LoginView },
  { path: "/register", component: RegisterView },
  { path: "/", component: TopicListView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
