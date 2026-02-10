<template>
  <div class="flex flex-column h-full">
    <div
      class="p-3 border-bottom-1 surface-border flex justify-content-between align-items-center bg-gray-50"
    >
      <h3 class="m-0 text-lg text-800 flex align-items-center gap-2">
        <i class="pi pi-comments text-primary"></i>
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

    <div
      v-if="loading"
      class="flex align-items-center justify-content-center p-4"
    >
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>

    <div
      v-else-if="conversations.length === 0"
      class="flex flex-column align-items-center justify-content-center flex-1 text-gray-500 p-4"
    >
      <i class="pi pi-inbox text-4xl mb-3"></i>
      <p class="m-0 mb-3">Brak konwersacji</p>
      <Button
        label="Nowa wiadomość"
        icon="pi pi-send"
        size="small"
        outlined
        @click="$emit('new-chat')"
      />
    </div>

    <div v-else class="flex-1 overflow-y-auto custom-scrollbar">
      <div
        v-for="conv in conversations"
        :key="conv.conversationId"
        class="flex align-items-center gap-3 p-3 cursor-pointer border-bottom-1 surface-border transition-colors transition-duration-150 hover:surface-hover"
        :class="{
          'bg-primary-50 border-left-3 border-primary':
            selectedUserId === conv.otherUser._id,
        }"
        @click="$emit('select-conversation', conv.otherUser._id)"
      >
        <Avatar
          :label="conv.otherUser.username?.[0]?.toUpperCase()"
          shape="circle"
          size="normal"
          class="bg-gray-200 text-700 font-bold"
        />

        <div class="flex-1 overflow-hidden">
          <div class="flex justify-content-between align-items-center mb-1">
            <span class="font-semibold text-900 text-sm">
              {{ isAdmin ? conv.otherUser.username : "Administracja" }}
            </span>
            <Badge
              v-if="isAdmin && conv.otherUser.role === 'admin'"
              value="Admin"
              severity="danger"
              class="text-xs"
            />
          </div>
          <p
            class="m-0 text-sm text-600 white-space-nowrap overflow-hidden text-overflow-ellipsis"
          >
            <span v-if="conv.lastMessage.isFromMe" class="font-medium"
              >Ty:
            </span>
            {{ truncateMessage(conv.lastMessage.content) }}
          </p>
        </div>

        <Badge
          v-if="conv.unreadCount > 0"
          :value="conv.unreadCount"
          severity="danger"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  conversations: { type: Array, required: true },
  selectedUserId: { type: String, default: null },
  loading: Boolean,
  isAdmin: Boolean,
});

defineEmits(["select-conversation", "new-chat"]);

const truncateMessage = (message) => {
  if (!message) return "";
  return message.length > 30 ? message.substring(0, 30) + "..." : message;
};
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
