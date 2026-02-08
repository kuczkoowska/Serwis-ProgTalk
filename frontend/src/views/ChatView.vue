<template>
  <div class="chat-view">
    <Toast />

    <div class="chat-container">
      <ConversationsList
        :conversations="chatStore.conversations"
        :selectedUserId="chatStore.selectedUserId"
        :loading="chatStore.loading"
        :isAdmin="authStore.user?.role === 'admin'"
        @select-conversation="selectConversation"
        @new-chat="showNewChatDialog = true"
      />

      <ChatMessages
        :selectedUser="chatStore.selectedUser"
        :messages="chatStore.messages"
        :loading="chatStore.loadingMessages"
        :currentUserId="authStore.user?._id"
        @send-message="sendMessage"
        @back="chatStore.selectedUserId = null"
      />
    </div>

    <NewChatDialog
      v-model:visible="showNewChatDialog"
      :users="chatStore.availableUsers"
      :loading="chatStore.loadingUsers"
      @select-user="startNewChat"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "../stores/auth";
import { useChatStore } from "../stores/chat";
import { useUserSocketNotifications } from "../composables/useSocketNotifications";
import { useChatSocketHandlers } from "../composables/chat";
import { useToastHelper } from "../composables/useToastHelper";
import ConversationsList from "../components/chat/ConversationsList.vue";
import ChatMessages from "../components/chat/ChatMessages.vue";
import NewChatDialog from "../components/chat/NewChatDialog.vue";

const authStore = useAuthStore();
const chatStore = useChatStore();
const { showError } = useToastHelper();
const { handleNewMessage, handleMessageSent, handleSupportMessage } =
  useChatSocketHandlers();

const showNewChatDialog = ref(false);

const selectConversation = async (userId) => {
  chatStore.selectConversation(userId);
  await chatStore.fetchMessages(userId);
  await chatStore.markAsRead(userId);
  await chatStore.fetchConversations();
};

const startNewChat = async (userId) => {
  showNewChatDialog.value = false;
  chatStore.selectConversation(userId);

  const existing = chatStore.conversations.find(
    (c) => c.otherUser._id === userId,
  );
  if (existing) {
    await chatStore.fetchMessages(userId);
  } else {
    const user = chatStore.availableUsers.find((u) => u._id === userId);
    if (user) {
      chatStore.addOrUpdateConversation({
        conversationId: `temp_${userId}`,
        otherUser: user,
        lastMessage: { content: "", createdAt: new Date(), isFromMe: true },
        unreadCount: 0,
      });
    }
    chatStore.clearMessages();
  }
};

const sendMessage = async (content) => {
  if (!content || !chatStore.selectedUserId) return;

  try {
    await chatStore.sendMessage(chatStore.selectedUserId, content);
    await chatStore.fetchConversations();
  } catch (error) {
    showError(
      error?.response?.data?.message || "Nie udało się wysłać wiadomości",
    );
  }
};

watch(showNewChatDialog, async (visible) => {
  if (visible) {
    await chatStore.fetchAvailableUsers(authStore.user?.role === "admin");
  }
});

useUserSocketNotifications({
  onNewMessage: handleNewMessage,
  onMessageSent: handleMessageSent,
  onSupportMessage: handleSupportMessage,
});

onMounted(async () => {
  try {
    await chatStore.fetchConversations();

    if (
      authStore.user?.role !== "admin" &&
      chatStore.conversations.length > 0
    ) {
      const firstConv = chatStore.conversations[0];
      if (firstConv?.otherUser?._id) {
        await selectConversation(firstConv.otherUser._id);
      }
    }
  } catch (error) {
    showError("Nie udało się załadować konwersacji");
  }
});
</script>

<style scoped>
.chat-view {
  height: calc(100vh - 80px);
  padding: 1rem;
}

.chat-container {
  display: flex;
  height: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.conversations-panel {
  width: 320px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.converschatStore.ations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.conversation-item:hover {
  background: #f3f4f6;
}

.conversation-item.active {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.username {
  font-weight: 600;
}

.role-badge {
  font-size: 0.65rem;
}

.last-message {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  flex-shrink: 0;
}

.messages-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #9ca3af;
}

.no-selection i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-header .user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message-input {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
}

.message-field {
  flex: 1;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.new-chat-content {
  min-height: 200px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f3f4f6;
}

.user-item .user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-item .email {
  font-size: 0.8rem;
  color: #6b7280;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .conversations-panel {
    width: 100%;
    display: block;
  }

  .messages-panel {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
  }

  .chat-container:has(.messages-panel .chat-header) .conversations-panel {
    display: none;
  }

  .chat-container:has(.messages-panel .chat-header) .messages-panel {
    display: flex;
  }

  .mobile-only {
    display: inline-flex;
  }
}
</style>
