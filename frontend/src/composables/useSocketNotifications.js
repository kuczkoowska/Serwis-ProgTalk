import { onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useRoute } from "vue-router";
import socketService from "../plugins/socket";
import { useAuthStore } from "../stores/auth";
import { useChatStore } from "../stores/chat";

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

export function useAdminSocketNotifications(onDataChange) {
  const { setupSocketListeners } = useSocketNotifications();
  let cleanup = null;

  onMounted(() => {
    socketService.joinAdminRoom();

    cleanup = setupSocketListeners([
      {
        event: "new_user_registration",
        handler: onDataChange,
        toastConfig: { severity: "info", summary: "Nowa rejestracja" },
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
}

export function useTopicSocketNotifications(topicId, handlers = {}) {
  const { setupSocketListeners } = useSocketNotifications();
  let cleanup = null;

  onMounted(() => {
    socketService.joinTopic(topicId.value);

    cleanup = setupSocketListeners([
      { event: "new_post", handler: handlers.onNewPost },
      { event: "post_liked", handler: handlers.onPostLiked },
      { event: "new_subtopic", handler: handlers.onNewSubtopic },
      {
        event: "post_deleted",
        handler: handlers.onPostDeleted,
        toastConfig: {
          severity: "info",
          summary: "Post usunięty",
          skipIfSelf: true,
        },
      },
      {
        event: "topic_closed",
        handler: handlers.onTopicClosed,
        toastConfig: {
          severity: "warn",
          summary: "Temat zamknięty",
          skipIfSelf: true,
        },
      },
      {
        event: "topic_opened",
        handler: handlers.onTopicOpened,
        toastConfig: {
          severity: "success",
          summary: "Temat otwarty",
          skipIfSelf: true,
        },
      },
      {
        event: "topic_hidden",
        handler: handlers.onTopicHidden,
        toastConfig: {
          severity: "error",
          summary: "Temat ukryty",
          skipIfSelf: true,
        },
      },
      {
        event: "topic_unhidden",
        handler: handlers.onTopicUnhidden,
        toastConfig: {
          severity: "success",
          summary: "Temat odkryty",
          skipIfSelf: true,
        },
      },
      {
        event: "moderator_added",
        handler: handlers.onModeratorAdded,
        toastConfig: {
          severity: "info",
          summary: "Nowy moderator",
          skipIfSelf: true,
        },
      },
      {
        event: "moderator_removed",
        handler: handlers.onModeratorRemoved,
        toastConfig: {
          severity: "info",
          summary: "Moderator usunięty",
          skipIfSelf: true,
        },
      },
      {
        event: "user_blocked_in_topic",
        handler: handlers.onUserBlockedInTopic,
        toastConfig: { severity: "warn", summary: "Użytkownik zablokowany" },
      },
      {
        event: "user_unblocked_in_topic",
        handler: handlers.onUserUnblockedInTopic,
        toastConfig: { severity: "info", summary: "Użytkownik odblokowany" },
      },
    ]);
  });

  onUnmounted(() => {
    socketService.leaveTopic(topicId.value);
    if (cleanup) cleanup();
  });
}

export function useTopicsListSocketNotifications(handlers = {}) {
  const { setupSocketListeners } = useSocketNotifications();
  let cleanup = null;

  onMounted(() => {
    socketService.joinTopicsList();

    cleanup = setupSocketListeners([
      { event: "new_topic", handler: handlers.onNewTopic },
    ]);
  });

  onUnmounted(() => {
    socketService.leaveTopicsList();
    if (cleanup) cleanup();
  });
}

export function useUserSocketNotifications(handlers = {}) {
  const { setupSocketListeners } = useSocketNotifications();
  const authStore = useAuthStore();
  let cleanup = null;

  onMounted(() => {
    if (!authStore.user?._id) return;

    const events = [
      { event: "new_message", handler: handlers.onNewMessage },
      { event: "message_sent", handler: handlers.onMessageSent },
      {
        event: "user_blocked_in_topic",
        handler: handlers.onUserBlockedInTopic,
        toastConfig: { severity: "error", summary: "Zablokowano w temacie" },
      },
      {
        event: "user_unblocked_in_topic",
        handler: handlers.onUserUnblockedInTopic,
        toastConfig: { severity: "success", summary: "Odblokowano w temacie" },
      },
      {
        event: "application_approved",
        handler: handlers.onApplicationApproved,
        toastConfig: {
          severity: "success",
          summary: "Zgłoszenie zatwierdzone",
        },
      },
      {
        event: "application_rejected",
        handler: handlers.onApplicationRejected,
        toastConfig: { severity: "warn", summary: "Zgłoszenie odrzucone" },
      },
      {
        event: "new_moderator_application",
        handler: handlers.onNewModeratorApplication,
        toastConfig: {
          severity: "info",
          summary: "Nowe zgłoszenie moderatora",
        },
      },
    ];

    if (authStore.user?.role === "admin") {
      socketService.joinAdminRoom();
      events.push({
        event: "new_support_message",
        handler: handlers.onSupportMessage || handlers.onNewMessage,
      });
    }

    cleanup = setupSocketListeners(events);
  });

  onUnmounted(() => {
    if (cleanup) cleanup();
  });
}

export function useGlobalUserSocketNotifications() {
  const authStore = useAuthStore();
  const chatStore = useChatStore();
  const route = useRoute();
  let cleanup = null;

  const setup = () => {
    if (!authStore.user?._id) return;

    chatStore.fetchUnreadCount();

    const onBlocked = (data) => {
      alert(data.message || "Twoje konto zostało zablokowane.");
      authStore.logout();
    };

    const onChatMessage = (data) => {
      if (!data?.message) return;

      const senderId = (
        data.message.sender?._id || data.message.sender
      )?.toString();
      if (senderId === authStore.user?._id?.toString()) return;

      if (route.path !== "/chat") {
        chatStore.incrementUnread();
      }
    };

    socketService.on("user_blocked_globally", onBlocked);
    socketService.on("new_message", onChatMessage);

    if (authStore.user?.role === "admin") {
      socketService.on("new_support_message", onChatMessage);
    }

    cleanup = () => {
      socketService.off("user_blocked_globally", onBlocked);
      socketService.off("new_message", onChatMessage);
      if (authStore.user?.role === "admin") {
        socketService.off("new_support_message", onChatMessage);
      }
    };
  };

  onMounted(setup);

  onUnmounted(() => {
    if (cleanup) cleanup();
  });
}
