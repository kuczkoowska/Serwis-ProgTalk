import { useToast } from "primevue/usetoast";
import socketService from "../plugins/socket";
import { useAuthStore } from "../stores/auth";

export function useSocketNotifications() {
  const toast = useToast();
  const authStore = useAuthStore();

  const showToast = (severity, summary, detail, life = 5000) => {
    toast.add({ severity, summary, detail, life });
  };

  const setupSocketListeners = (events) => {
    const handlers = {};

    events.forEach(({ event, handler, toastConfig }) => {
      const wrappedHandler = (data) => {
        if (handler) handler(data);

        if (toastConfig) {
          const { severity, summary, skipIfSelf } = toastConfig;

          if (skipIfSelf) {
            const selfUsername = authStore.user?.username;
            const actionUsername =
              data.approvedBy ||
              data.rejectedBy ||
              data.blockedBy ||
              data.unblockedBy ||
              data.closedBy ||
              data.openedBy ||
              data.hiddenBy ||
              data.unhiddenBy ||
              data.promotedBy ||
              data.removedBy ||
              data.deletedBy;
            if (actionUsername === selfUsername) return;
          }

          showToast(severity, summary, data.message || "");
        }
      };

      handlers[event] = wrappedHandler;
      socketService.on(event, wrappedHandler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socketService.off(event, handler);
      });
    };
  };

  return { showToast, setupSocketListeners };
}
