import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./stores/auth";
import LoginView from "./views/auth/LoginView.vue";

const routes = [
  {
    path: "/login",
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    component: () => import("./views/auth/RegisterView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/verify-email/:token",
    component: () => import("./views/auth/VerifyEmailView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/pending-approval",
    component: () => import("./views/auth/PendingApprovalView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    component: () => import("./views/topics/TopicListView.vue"),
    meta: { requiresAuth: true, requiresApproval: true },
  },
  {
    path: "/topic/:id",
    name: "TopicDetails",
    component: () => import("./views/topics/TopicDetailsView.vue"),
    meta: { requiresAuth: true, requiresApproval: true },
  },
  {
    path: "/profile",
    component: () => import("./views/user/ProfileView.vue"),
    meta: { requiresAuth: true, requiresApproval: true },
  },
  {
    path: "/admin",
    component: () => import("./views/admin/AdminPanelView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/chat",
    component: () => import("./views/ChatView.vue"),
    meta: { requiresAuth: true, requiresApproval: true },
  },
  // 404
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isAuthenticated = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin;
  const isActive = authStore.user?.isActive;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  if (to.meta.guestOnly && isAuthenticated) return next("/");

  if (!isAuthenticated) return next();

  if (to.meta.requiresApproval && !isActive && !isAdmin) {
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

  next();
});

export default router;
