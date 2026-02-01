import { onMounted, onUnmounted } from "vue";
import socketService from "../../plugins/socket";
import { useAuthStore } from "../../stores/auth";
import { useSocketNotifications } from "./useSocketNotifications";

export const useUserSocketNotifications = (handlers = {}) => {
  const { setupSocketListeners } = useSocketNotifications();
  const authStore = useAuthStore();
  let cleanup = null;

  onMounted(() => {
    if (authStore.user?._id) {
      socketService.emit("join_user_room", authStore.user._id);

      cleanup = setupSocketListeners([
        {
          event: "new_message",
          handler: handlers.onNewMessage,
        },
        {
          event: "message_sent",
          handler: handlers.onMessageSent,
        },
      ]);
    }
  });

  onUnmounted(() => {
    if (authStore.user?._id) {
      socketService.emit("leave_user_room", authStore.user._id);
    }
    if (cleanup) cleanup();
  });
};
