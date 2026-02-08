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
</style>
