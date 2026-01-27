import { createRouter, createWebHistory } from "vue-router";
import LoginView from "./views/auth/LoginView.vue";
import RegisterView from "./views/auth/RegisterView.vue";
import TopicListView from "./views/topics/TopicListView.vue";
import TopicDetailsView from "./views/topics/TopicDetailsView.vue";
import ProfileView from "./views/user/ProfileView.vue";
import { useAuthStore } from "./stores/auth";

const routes = [
  { path: "/login", component: LoginView, meta: { guestOnly: true } },
  { path: "/register", component: RegisterView, meta: { guestOnly: true } },
  { path: "/", component: TopicListView, meta: { requiresAuth: true } },
  {
    path: "/topic/:id",
    component: TopicDetailsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isAuthenticated = !!authStore.token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return next("/");
  }

  next();
});

export default router;
