import { ref, computed } from "vue";
import { defineStore } from "pinia";
import api from "../plugins/axios";
import { useAuthStore } from "./auth";

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
      (c) => c.otherUser._id === selectedUserId.value,
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
      throw error;
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
      throw error;
    } finally {
      loadingMessages.value = false;
    }
  }

  async function fetchAvailableUsers(isAdmin = false) {
    loadingUsers.value = true;
    try {
      const { data } = await api.get("/admin/users", {
        params: { status: "approved" },
      });
      const users = data.data.users || [];
      availableUsers.value = isAdmin
        ? users
        : users.filter((user) => user.role === "admin");
    } catch (error) {
      try {
        const { data } = await api.get("/users");
        const users = data.data.users || [];
        availableUsers.value = isAdmin
          ? users
          : users.filter((user) => user.role === "admin");
      } catch (fallbackError) {
        console.error("Błąd zapasowego ładowania użytkowników:", fallbackError);
        throw error;
      }
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
    const exists = messages.value.find((m) => m._id === message._id);
    if (!exists) {
      messages.value = [...messages.value, message];
    }
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
  };
});
