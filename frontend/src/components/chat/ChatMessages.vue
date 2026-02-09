<template>
  <div class="messages-panel">
    <div v-if="!selectedUser" class="no-selection">
      <i class="pi pi-comments"></i>
      <p>Wybierz konwersację lub rozpocznij nową</p>
    </div>

    <template v-else>
      <div class="chat-header">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          class="back-btn mobile-only"
          @click="$emit('back')"
        />
        <Avatar :user="selectedUser" size="normal" />
        <div class="user-info">
          <span class="username">
            <template v-if="isAdmin">
              {{ selectedUser.username }}
            </template>
            <template v-else>
              Administracja
            </template>
          </span>
          <Badge
            v-if="isAdmin && selectedUser.role === 'admin'"
            value="Administrator"
            severity="danger"
          />
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div v-if="loading" class="loading-state">
          <ProgressSpinner strokeWidth="4" style="width: 40px; height: 40px" />
        </div>

        <div v-else-if="messages.length === 0" class="empty-state">
          <p>Brak wiadomości. Rozpocznij rozmowę!</p>
        </div>

        <div v-else class="messages-list">
          <div
            v-for="msg in messages"
            :key="msg._id"
            class="message-row"
            :class="messageRowClass(msg)"
          >
            <div class="message-avatar" v-if="messageRowClass(msg).includes('message-row--other')">
              <Avatar :user="msg.sender" size="small" />
            </div>
            <div
              class="message-bubble"
              :class="messageRowClass(msg).includes('message-row--own') ? 'message-bubble--own' : 'message-bubble--other'"
            >
              <div
                class="message-sender"
                v-if="messageRowClass(msg).includes('message-row--other')"
              >
                {{ msg.sender.username }}
              </div>
              <p class="message-text">{{ msg.content }}</p>
              <span class="message-time">
                {{ formatTime(msg.createdAt) }}
                <i
                  v-if="msg.read && messageRowClass(msg).includes('message-row--own')"
                  class="pi pi-check-circle"
                  style="font-size: 0.7rem; margin-left: 3px"
                ></i>
                <i
                  v-else-if="messageRowClass(msg).includes('message-row--own')"
                  class="pi pi-check"
                  style="font-size: 0.7rem; margin-left: 3px"
                ></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="message-input">
        <InputText
          v-model="newMessage"
          placeholder="Napisz wiadomość..."
          class="message-field"
          @keyup.enter="sendMessage"
        />
        <Button
          icon="pi pi-send"
          :loading="sending"
          :disabled="!newMessage.trim()"
          @click="sendMessage"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, nextTick, computed } from "vue";
import { useAuthStore } from "../../stores/auth";

const props = defineProps({
  selectedUser: {
    type: Object,
    default: null,
  },
  messages: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  currentUserId: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["send-message", "back"]);

const newMessage = ref("");
const sending = ref(false);
const messagesContainer = ref(null);

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  const content = newMessage.value.trim();
  newMessage.value = "";
  emit("send-message", content);
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const authStore = useAuthStore();
const resolvedCurrentUserId = computed(() => props.currentUserId || authStore.user?._id);

// Funkcja rozróżniająca stronę wiadomości zależnie od roli
const messageRowClass = (msg) => {
  const senderId = (msg.sender?._id?.toString?.() || msg.sender?._id || msg.sender)?.toString();
  const role = msg.sender?.role;
  const currentId = resolvedCurrentUserId.value?.toString();
  if (props.isAdmin) {
    // Admin widzi swoje po prawej, usera po lewej
    if (senderId && currentId && senderId === currentId) return 'message-row--own';
    return 'message-row--other';
  } else {
    // User widzi swoje po prawej, adminów po lewej
    if (role === 'admin') return 'message-row--other';
    if (senderId && currentId && senderId === currentId) return 'message-row--own';
    return 'message-row--other';
  }
};

watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  },
);

watch(
  () => props.selectedUser,
  async () => {
    await nextTick();
    scrollToBottom();
  },
);
</script>

<style scoped>
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

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 75%;
}

.message-row--own {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-row--other {
  align-self: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  margin-bottom: 0.25rem;
}

.message-bubble {
  padding: 0.625rem 0.875rem;
  border-radius: 16px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.message-bubble--own {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble--other {
  background: #f0f0f0;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.message-sender {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: #6b7280;
}

.message-bubble--other .message-sender {
  color: #3b82f6;
}

.message-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
  font-size: 0.9rem;
}

.message-time {
  font-size: 0.65rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0.25rem;
  gap: 2px;
}

.message-bubble--own .message-time {
  color: rgba(255, 255, 255, 0.8);
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

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .mobile-only {
    display: inline-flex;
  }
}
</style>
