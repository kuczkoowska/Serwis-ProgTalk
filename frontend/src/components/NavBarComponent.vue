<template>
  <div class="navbar-wrapper" v-if="isActive">
    <Menubar class="custom-menubar">
      <template #start>
        <router-link to="/" class="logo-link">
          <i class="pi pi-code logo-icon"></i>
          <span class="logo-text">ProgTalk</span>
        </router-link>
      </template>

      <template #end>
        <div>
          <div v-if="authStore.user">
            <div
              class="avatar-container"
              @click="toggleMenu"
              aria-haspopup="true"
              aria-controls="overlay_menu"
            >
              <Avatar
                :label="authStore.user?.username?.charAt(0).toUpperCase()"
                shape="circle"
                size="normal"
              />
              <i class="pi pi-angle-down"></i>
            </div>

            <Menu
              ref="menu"
              id="overlay_menu"
              :model="userMenuItems"
              :popup="true"
            />
          </div>

          <div v-else>
            <router-link to="/login">
              <Button label="Zaloguj" size="small" rounded />
            </router-link>
          </div>
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const menu = ref(null);

const isAdmin = computed(() => authStore.user?.role === "admin");
const isActive = computed(() => authStore.user?.isActive !== false);

const userMenuItems = computed(() => {
  const menuItems = [
    {
      label: "Mój Profil",
      icon: "pi pi-user",
      command: () => router.push("/profile"),
    },
    {
      label: "Wiadomości",
      icon: "pi pi-comments",
      command: () => router.push("/chat"),
    },
  ];

  if (isAdmin.value) {
    menuItems.push({
      label: "Panel Admina",
      icon: "pi pi-shield",
      command: () => router.push("/admin"),
    });
  }

  menuItems.push(
    {
      separator: true,
    },
    {
      label: "Wyloguj",
      icon: "pi pi-sign-out",
      command: () => handleLogout(),
    },
  );

  return menuItems;
});

const toggleMenu = (event) => {
  menu.value.toggle(event);
};

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.custom-menubar {
  padding: 0.5rem 2rem;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  margin-right: 2rem;
}

.logo-icon {
  font-size: 1.5rem;
  color: var(--p-primary-color);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.avatar-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 8px;
}
</style>
