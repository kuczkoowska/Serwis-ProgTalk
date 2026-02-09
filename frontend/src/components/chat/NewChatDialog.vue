<template>
  <Dialog
    :visible="visible"
    header="Nowa konwersacja"
    :style="{ width: '400px' }"
    modal
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="new-chat-content">
      <template v-if="isAdmin">
        <div v-if="loading" class="loading-state">
          <ProgressSpinner strokeWidth="4" style="width: 40px; height: 40px" />
        </div>
        <div v-else-if="users.length === 0" class="empty-state">
          <p>Brak dostępnych użytkowników</p>
        </div>
        <div v-else class="users-list">
          <div
            v-for="user in users"
            :key="user._id"
            class="user-item"
            @click="$emit('select-user', user._id)"
          >
            <Avatar :user="user" size="normal" />
            <div class="user-info">
              <span class="username">{{ user.username }}</span>
              <span class="email">{{ user.email }}</span>
            </div>
            <Badge v-if="user.role === 'admin'" value="Admin" severity="danger" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="empty-state">
          <Button label="Napisz do administracji" icon="pi pi-send" @click="$emit('select-user', 'support')" />
        </div>
      </template>
    </div>
  </Dialog>
</template>

<script setup>

import { defineProps, defineEmits } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  users: {
    type: Array,
    required: true,
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

defineEmits(["update:visible", "select-user"]);
</script>

<style scoped>
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

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #9ca3af;
}
</style>
