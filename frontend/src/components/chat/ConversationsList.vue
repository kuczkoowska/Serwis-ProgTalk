<template>
  <div class="conversations-panel">
    <div class="panel-header">
      <h3>
        <i class="pi pi-comments"></i>
        Wiadomości
      </h3>
      <Button
        icon="pi pi-plus"
        rounded
        text
        severity="secondary"
        @click="$emit('new-chat')"
        v-tooltip="isAdmin ? 'Nowa konwersacja' : 'Napisz do admina'"
      />
    </div>

    <div v-if="loading" class="loading-state">
      <ProgressSpinner strokeWidth="4" style="width: 40px; height: 40px" />
    </div>

    <div v-else-if="conversations.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <p>Brak konwersacji</p>
      <Button
        label="Napisz do admina"
        icon="pi pi-send"
        size="small"
        @click="$emit('new-chat')"
      />
    </div>

    <div v-else class="conversations-list">
      <div
        v-for="conv in conversations"
        :key="conv.conversationId"
        class="conversation-item"
        :class="{ active: selectedUserId === conv.otherUser._id }"
        @click="$emit('select-conversation', conv.otherUser._id)"
      >
        <Avatar :user="conv.otherUser" size="normal" />
        <div class="conversation-info">
          <div class="conversation-header">
            <span class="username">{{ conv.otherUser.username }}</span>
            <Badge
              v-if="conv.otherUser.role === 'admin'"
              value="Admin"
              severity="danger"
              class="role-badge"
            />
          </div>
          <p class="last-message">
            <span v-if="conv.lastMessage.isFromMe">Ty: </span>
            {{ truncateMessage(conv.lastMessage.content) }}
          </p>
        </div>
        <Badge
          v-if="conv.unreadCount > 0"
          :value="conv.unreadCount"
          severity="info"
          class="unread-badge"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  conversations: {
    type: Array,
    required: true,
  },
  selectedUserId: {
    type: String,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["select-conversation", "new-chat"]);

const truncateMessage = (message) => {
  if (!message) return "";
  return message.length > 30 ? message.substring(0, 30) + "..." : message;
};
</script>

<style scoped>
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

.conversations-list {
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

@media (max-width: 768px) {
  .conversations-panel {
    width: 100%;
    display: block;
  }
}
</style>
