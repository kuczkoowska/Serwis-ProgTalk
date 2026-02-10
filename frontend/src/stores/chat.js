import { ref, computed } from "vue";
import { defineStore } from "pinia";
import api from "../plugins/axios";
import { useAuthStore } from "./auth";
import socketService from "../plugins/socket";

const normalizeId = (id) => {
  if (!id) return "";
  return typeof id === "object" ? id.toString() : id;
};

export const useChatStore = defineStore("chat", () => {
  const conversations = ref([]);
  const messages = ref([]);
  const selectedUserId = ref(null);
  const availableUsers = ref([]);
  const unreadCount = ref(0);

  const loading = ref(false);
  const loadingMessages = ref(false);
  const loadingUsers = ref(false);

  const selectedUser = computed(() => {
    const conv = conversations.value.find(
      (c) => normalizeId(c.otherUser._id) === normalizeId(selectedUserId.value),
    );
    return conv?.otherUser || null;
  });

  async function fetchConversations() {
    loading.value = true;
    try {
      const { data } = await api.get("/chat/conversations");
      conversations.value = data.data.conversations;
    } catch (error) {
      console.error("Błąd ładowania konwersacji:", error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMessages(userId) {
    loadingMessages.value = true;
    try {
      const { data } = await api.get(`/chat/messages/${userId}`);
      messages.value = data.data.messages;
    } catch (error) {
      console.error("Błąd ładowania wiadomości:", error);
    } finally {
      loadingMessages.value = false;
    }
  }

  async function fetchAvailableUsers(isAdmin = false) {
    loadingUsers.value = true;
    try {
      const url = isAdmin ? "/admin/users" : "/users";
      const params = isAdmin ? { status: "approved" } : {};

      const { data } = await api.get(url, { params });
      const users = data.data.users || [];

      availableUsers.value = isAdmin
        ? users
        : users.filter((user) => user.role === "admin");
    } catch (error) {
      console.error("Błąd pobierania użytkowników:", error);
    } finally {
      loadingUsers.value = false;
    }
  }

  async function sendMessage(userId, content) {
    try {
      const authStore = useAuthStore();
      const isAdmin = authStore.user?.role === "admin";
      const targetId = isAdmin ? userId : "support";

      const { data } = await api.post(`/chat/messages/${targetId}`, {
        content,
      });

      const msg = data.data.message;

      addMessage(msg);

      return msg;
    } catch (error) {
      console.error("Błąd wysyłania wiadomości:", error);
      throw error;
    }
  }

  async function markAsRead(recipientId) {
    try {
      await api.patch(`/chat/messages/${recipientId}/read`);
      await fetchUnreadCount();

      const conv = conversations.value.find(
        (c) => normalizeId(c.otherUser._id) === normalizeId(recipientId),
      );
      if (conv) conv.unreadCount = 0;
    } catch (error) {
      console.error("Błąd oznaczania jako przeczytane:", error);
    }
  }

  async function fetchUnreadCount() {
    try {
      const { data } = await api.get("/chat/unread-count");
      unreadCount.value = data.data.unreadCount || 0;
    } catch (error) {
      console.error("Błąd pobierania liczby nieprzeczytanych:", error);
    }
  }

  function incrementUnread() {
    unreadCount.value++;
  }

  function selectConversation(userId) {
    selectedUserId.value = userId;
  }

  function addMessage(message) {
    const authStore = useAuthStore();
    const myId = normalizeId(authStore.user?._id);
    const amIAdmin = authStore.user?.role === "admin";

    const senderObj =
      typeof message.sender === "object"
        ? message.sender
        : { _id: message.sender };
    const receiverIdRaw =
      typeof message.receiver === "object"
        ? message.receiver._id
        : message.receiver;

    let msgSenderId = normalizeId(senderObj._id);
    let msgReceiverId = normalizeId(receiverIdRaw);

    if (!amIAdmin) {
      if (senderObj.role === "admin") {
        msgSenderId = "support";
      }

      if (msgSenderId === myId) {
        msgReceiverId = "support";
      }
    }

    const currentChatId = normalizeId(selectedUserId.value);

    const isFromCurrentPartner =
      msgSenderId === currentChatId && msgSenderId !== myId;
    const isToCurrentPartner =
      msgReceiverId === currentChatId && msgSenderId === myId;

    if (isFromCurrentPartner || isToCurrentPartner) {
      const exists = messages.value.find((m) => m._id === message._id);
      if (!exists) {
        messages.value.push(message);

        if (isFromCurrentPartner) {
          markAsRead(currentChatId);
        }
      }
    } else if (msgSenderId !== myId) {
      incrementUnread();
    }

    fetchConversations();
  }

  function addOrUpdateConversation(conversation) {
    const existingIndex = conversations.value.findIndex(
      (c) => c.conversationId === conversation.conversationId,
    );

    if (existingIndex !== -1) {
      conversations.value[existingIndex] = conversation;
    } else {
      conversations.value.unshift(conversation);
    }
  }

  function clearMessages() {
    messages.value = [];
  }

  function reset() {
    conversations.value = [];
    messages.value = [];
    selectedUserId.value = null;
    availableUsers.value = [];
    unreadCount.value = 0;
    loading.value = false;
    loadingMessages.value = false;
    loadingUsers.value = false;
  }

  const handleSocketMessage = (data) => {
    if (data && data.message) {
      addMessage(data.message);
    }
  };

  function initChatSockets() {
    socketService.on("new_message", handleSocketMessage);
    socketService.on("new_support_message", handleSocketMessage);
    socketService.on("message_sent", handleSocketMessage);
  }

  function cleanupChatSockets() {
    socketService.off("new_message", handleSocketMessage);
    socketService.off("new_support_message", handleSocketMessage);
    socketService.off("message_sent", handleSocketMessage);
  }

  return {
    conversations,
    messages,
    selectedUserId,
    selectedUser,
    availableUsers,
    unreadCount,
    loading,
    loadingMessages,
    loadingUsers,

    fetchConversations,
    fetchMessages,
    fetchAvailableUsers,
    sendMessage,
    markAsRead,
    fetchUnreadCount,
    incrementUnread,
    selectConversation,
    addMessage,
    addOrUpdateConversation,
    clearMessages,
    reset,

    initChatSockets,
    cleanupChatSockets,
  };
});
