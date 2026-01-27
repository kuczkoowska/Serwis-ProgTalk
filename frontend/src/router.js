import { createRouter, createWebHistory } from "vue-router";
import LoginView from "./views/auth/LoginView.vue";
import RegisterView from "./views/auth/RegisterView.vue";
import PendingApprovalView from "./views/auth/PendingApprovalView.vue";
import TopicListView from "./views/topics/TopicListView.vue";
import TopicDetailsView from "./views/topics/TopicDetailsView.vue";
import ProfileView from "./views/user/ProfileView.vue";
import AdminPanelView from "./views/admin/AdminPanelView.vue";
import { useAuthStore } from "./stores/auth";

const routes = [
  { path: "/login", component: LoginView, meta: { guestOnly: true } },
  { path: "/register", component: RegisterView, meta: { guestOnly: true } },
  {
    path: "/pending-approval",
    component: PendingApprovalView,
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    component: TopicListView,
    meta: { requiresAuth: true, requiresApproval: true },
  },
  {
    path: "/topic/:id",
    component: TopicDetailsView,
    meta: { requiresAuth: true, requiresApproval: true },
  },
  {
    path: "/profile",
    component: ProfileView,
    meta: { requiresAuth: true, requiresApproval: true },
  },
  {
    path: "/admin",
    component: AdminPanelView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isAuthenticated = !!authStore.token;
  const isAdmin = authStore.user?.role === "admin";
  const isActive = authStore.user?.isActive;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  if (to.meta.requiresApproval && isAuthenticated && !isActive && !isAdmin) {
    if (to.path !== "/pending-approval") {
      return next("/pending-approval");
    }
  }

  if (to.path === "/pending-approval" && isActive) {
    return next("/");
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next("/");
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return next("/");
  }

  next();
});

export default router;
