import { onMounted, onUnmounted } from "vue";
import socketService from "../../plugins/socket";
import { useSocketNotifications } from "./useSocketNotifications";

export const useAdminSocketNotifications = (onDataChange) => {
  const { setupSocketListeners } = useSocketNotifications();
  let cleanup = null;

  onMounted(() => {
    socketService.joinAdminRoom();

    cleanup = setupSocketListeners([
      {
        event: "new_user_registration",
        handler: onDataChange,
        toastConfig: {
          severity: "info",
          summary: "Nowa rejestracja",
        },
      },
      {
        event: "user_approved",
        handler: onDataChange,
        toastConfig: {
          severity: "success",
          summary: "Użytkownik zatwierdzony",
          skipIfSelf: true,
        },
      },
      {
        event: "user_rejected",
        handler: onDataChange,
        toastConfig: {
          severity: "warn",
          summary: "Użytkownik odrzucony",
          skipIfSelf: true,
        },
      },
      {
        event: "user_blocked",
        handler: onDataChange,
        toastConfig: {
          severity: "warn",
          summary: "Użytkownik zablokowany",
          skipIfSelf: true,
        },
      },
      {
        event: "user_unblocked",
        handler: onDataChange,
        toastConfig: {
          severity: "info",
          summary: "Użytkownik odblokowany",
          skipIfSelf: true,
        },
      },
    ]);
  });

  onUnmounted(() => {
    if (cleanup) cleanup();
  });
};
