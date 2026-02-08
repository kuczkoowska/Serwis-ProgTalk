import { useChatStore } from "../../stores/chat";
import { useAuthStore } from "../../stores/auth";

export const useChatSocketHandlers = () => {
  const chatStore = useChatStore();
  const authStore = useAuthStore();

  const isForOpenConversation = (msg) => {
    if (!chatStore.selectedUserId) return false;

    const currentUserId = authStore.user?._id;
    const isAdmin = authStore.user?.role === "admin";
    const selectedId = chatStore.selectedUserId;
    const convId = msg.conversationId;

    if (isAdmin) {
      return convId === `support_${selectedId}`;
    }

    return convId === `support_${currentUserId}`;
  };

  const isOwnMessage = (msg) => {
    const senderId = (msg.sender?._id || msg.sender)?.toString();
    return senderId === authStore.user?._id?.toString();
  };

  const processIncomingMessage = async (msg) => {
    if (!msg || !authStore.user?._id) return;

    if (isOwnMessage(msg)) return;

    if (isForOpenConversation(msg)) {
      chatStore.addMessage(msg);

      const isAdmin = authStore.user?.role === "admin";
      const recipientId = isAdmin
        ? chatStore.selectedUserId
        : authStore.user._id;
      chatStore.markAsRead(recipientId);
    }

    await chatStore.fetchConversations();
  };

  const handleNewMessage = async (data) => {
    await processIncomingMessage(data.message);
  };

  const handleSupportMessage = async (data) => {
    await processIncomingMessage(data.message);
  };

  const handleMessageSent = async (data) => {
    const msg = data.message;
    if (!msg || !authStore.user?._id) return;

    await chatStore.fetchConversations();
  };

  return {
    handleNewMessage,
    handleMessageSent,
    handleSupportMessage,
  };
};
