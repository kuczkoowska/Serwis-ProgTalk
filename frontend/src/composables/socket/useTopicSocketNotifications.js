import { onMounted, onUnmounted } from "vue";
import socketService from "../../plugins/socket";
import { useSocketNotifications } from "./useSocketNotifications";

export const useTopicSocketNotifications = (topicId, handlers = {}) => {
  const { setupSocketListeners } = useSocketNotifications();
  let cleanup = null;

  onMounted(() => {
    socketService.joinTopic(topicId.value);

    const events = [
      {
        event: "new_post",
        handler: handlers.onNewPost,
      },
      {
        event: "post_liked",
        handler: handlers.onPostLiked,
      },
      {
        event: "new_subtopic",
        handler: handlers.onNewSubtopic,
      },
      {
        event: "post_deleted",
        handler: handlers.onPostDeleted,
        toastConfig: {
          severity: "info",
          summary: "Post usunięty",
        },
      },
      {
        event: "topic_closed",
        handler: handlers.onTopicClosed,
        toastConfig: {
          severity: "warn",
          summary: "Temat zamknięty",
        },
      },
      {
        event: "topic_opened",
        handler: handlers.onTopicOpened,
        toastConfig: {
          severity: "success",
          summary: "Temat otwarty",
        },
      },
      {
        event: "topic_hidden",
        handler: handlers.onTopicHidden,
        toastConfig: {
          severity: "error",
          summary: "Temat ukryty",
        },
      },
      {
        event: "moderator_added",
        handler: handlers.onModeratorAdded,
        toastConfig: {
          severity: "info",
          summary: "Nowy moderator",
        },
      },
      {
        event: "moderator_removed",
        handler: handlers.onModeratorRemoved,
        toastConfig: {
          severity: "info",
          summary: "Moderator usunięty",
        },
      },
      {
        event: "user_blocked_in_topic",
        handler: handlers.onUserBlockedInTopic,
        toastConfig: {
          severity: "warn",
          summary: "Użytkownik zablokowany",
        },
      },
      {
        event: "user_unblocked_in_topic",
        handler: handlers.onUserUnblockedInTopic,
        toastConfig: {
          severity: "info",
          summary: "Użytkownik odblokowany",
        },
      },
    ];

    cleanup = setupSocketListeners(events);
  });

  onUnmounted(() => {
    socketService.leaveTopic(topicId.value);
    if (cleanup) cleanup();
  });
};
