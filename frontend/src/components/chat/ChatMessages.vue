<template>
  <div class="flex flex-column h-full">
    <div
      v-if="!selectedUser"
      class="flex flex-column align-items-center justify-content-center flex-1 text-gray-400"
    >
      <i class="pi pi-comments text-6xl mb-3"></i>
      <p class="text-xl">Wybierz konwersację lub rozpocznij nową</p>
    </div>

    <template v-else>
      <div
        class="p-3 border-bottom-1 surface-border flex align-items-center gap-3 bg-white shadow-1 z-1"
      >
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          class="md:hidden"
          @click="$emit('back')"
        />
        <Avatar
          :label="selectedUser.username?.[0]?.toUpperCase()"
          shape="circle"
          size="normal"
          class="bg-primary-100 text-primary-700 font-bold"
        />
        <div>
          <span class="font-bold text-900 block">
            {{ isAdmin ? selectedUser.username : "Administracja" }}
          </span>
          <Badge
            v-if="isAdmin && selectedUser.role === 'admin'"
            value="Administrator"
            severity="danger"
            class="text-xs mt-1"
          />
        </div>
      </div>

      <div
        class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50"
        ref="messagesContainer"
      >
        <div v-if="loading" class="flex justify-content-center p-4">
          <ProgressSpinner style="width: 40px; height: 40px" />
        </div>

        <div
          v-else-if="messages.length === 0"
          class="flex flex-column align-items-center justify-content-center h-full text-gray-500"
        >
          <p>To początek Twojej historii wiadomości.</p>
        </div>

        <div v-else class="flex flex-column gap-3">
          <div
            v-for="msg in messages"
            :key="msg._id"
            class="flex w-full"
            :class="
              isOwnMessage(msg)
                ? 'justify-content-end'
                : 'justify-content-start'
            "
          >
            <div
              class="max-w-20rem md:max-w-30rem p-3 shadow-1 border-round-xl"
              :class="
                isOwnMessage(msg)
                  ? 'bg-primary text-white border-bottom-right-none'
                  : 'bg-white text-800 border-bottom-left-none'
              "
            >
              <div
                v-if="!isOwnMessage(msg)"
                class="text-xs font-bold mb-1 opacity-70"
              >
                {{ msg.sender.username }}
              </div>

              <div class="line-height-3" style="word-break: break-word">
                {{ msg.content }}
              </div>

              <div
                class="text-right text-xs mt-1 opacity-70 flex align-items-center justify-content-end gap-1"
              >
                {{ formatTime(msg.createdAt) }}
                <i
                  v-if="isOwnMessage(msg) && msg.read"
                  class="pi pi-check-circle text-xs"
                ></i>
                <i
                  v-else-if="isOwnMessage(msg)"
                  class="pi pi-check text-xs"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 bg-white border-top-1 surface-border flex gap-2">
        <InputText
          v-model="newMessage"
          placeholder="Napisz wiadomość..."
          class="flex-1"
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
import { ref, watch, nextTick, computed } from "vue";
import { useAuthStore } from "../../stores/auth";

const props = defineProps({
  selectedUser: Object,
  messages: Array,
  loading: Boolean,
  currentUserId: String,
  isAdmin: Boolean,
});

const emit = defineEmits(["send-message", "back"]);

const newMessage = ref("");
const messagesContainer = ref(null);
const authStore = useAuthStore();

const resolvedCurrentUserId = computed(
  () => props.currentUserId || authStore.user?._id,
);

const isOwnMessage = (msg) => {
  const senderId = (msg.sender?._id || msg.sender)?.toString();
  const currentId = resolvedCurrentUserId.value?.toString();

  if (props.isAdmin) {
    return senderId === currentId;
  }

  if (senderId === currentId) return true;
  return false;
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  emit("send-message", newMessage.value.trim());
  newMessage.value = "";
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch([() => props.messages.length, () => props.selectedUser], async () => {
  await nextTick();
  scrollToBottom();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
</style>
