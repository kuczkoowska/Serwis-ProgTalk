<template>
  <div
    class="sticky top-0 z-5 bg-white border-bottom-1 surface-border"
    v-if="isActive !== undefined"
  >
    <Menubar class="border-none bg-transparent px-4 py-2">
      <template #start>
        <router-link
          to="/"
          class="flex align-items-center gap-2 no-underline text-900 hover:text-primary transition-colors transition-duration-200"
        >
          <i class="pi pi-code text-2xl text-primary"></i>
          <span class="text-xl font-bold">ProgTalk</span>
        </router-link>
      </template>

      <template #end>
        <div class="flex align-items-center gap-3">
          <template v-if="authStore.user">
            <div class="flex align-items-center gap-3">
              <router-link
                to="/chat"
                class="p-link relative flex align-items-center justify-content-center w-2rem h-2rem border-circle text-700 hover:bg-gray-100 transition-colors transition-duration-200"
                v-tooltip.bottom="'Wiadomości'"
              >
                <i class="pi pi-comments text-xl"></i>
                <Badge
                  v-if="chatStore.unreadCount > 0"
                  :value="chatStore.unreadCount"
                  severity="danger"
                  class="absolute -top-1 -right-1"
                  style="
                    min-width: 1rem;
                    height: 1rem;
                    line-height: 1rem;
                    font-size: 0.7rem;
                    padding: 0;
                  "
                />
              </router-link>

              <div
                class="flex align-items-center gap-2 cursor-pointer p-1 border-round hover:bg-gray-50 transition-colors transition-duration-200"
                @click="toggleMenu"
                aria-haspopup="true"
                aria-controls="overlay_menu"
              >
                <Avatar
                  :label="authStore.user?.username?.charAt(0).toUpperCase()"
                  shape="circle"
                  class="bg-primary-50 text-primary font-bold"
                />
                <i class="pi pi-angle-down text-gray-500 text-sm"></i>
              </div>
            </div>

            <Menu
              ref="menu"
              id="overlay_menu"
              :model="userMenuItems"
              :popup="true"
            />
          </template>

          <template v-else>
            <router-link to="/login">
              <Button
                label="Zaloguj"
                size="small"
                rounded
                icon="pi pi-sign-in"
              />
            </router-link>
          </template>
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useChatStore } from "../stores/chat";

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const menu = ref(null);

const isAdmin = computed(() => authStore.user?.role === "admin");
const isActive = computed(() => authStore.user?.isActive);

const handleLogout = async () => {
  await authStore.logout();
};

const userMenuItems = computed(() => {
  const menuItems = [
    {
      label: "Mój Profil",
      icon: "pi pi-user",
      command: () => router.push("/profile"),
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
    { separator: true },
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
</script>
