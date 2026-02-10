<template>
  <Dialog
    :visible="visible"
    header="Nowa konwersacja"
    modal
    class="w-full md:w-30rem"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column h-20rem">
      <template v-if="isAdmin">
        <div
          v-if="loading"
          class="flex align-items-center justify-content-center h-full"
        >
          <ProgressSpinner />
        </div>

        <div
          v-else-if="users.length === 0"
          class="flex align-items-center justify-content-center h-full text-gray-500"
        >
          <p>Brak dostępnych użytkowników</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <div class="flex flex-column gap-1">
            <div
              v-for="user in users"
              :key="user._id"
              class="flex align-items-center gap-3 p-3 border-round cursor-pointer hover:surface-hover transition-colors transition-duration-150"
              @click="$emit('select-user', user._id)"
            >
              <Avatar
                :label="user.username?.[0]?.toUpperCase()"
                shape="circle"
                class="bg-primary-50 text-primary font-bold"
              />
              <div class="flex-1">
                <span class="font-bold text-900 block">{{
                  user.username
                }}</span>
                <span class="text-sm text-600">{{ user.email }}</span>
              </div>
              <Badge
                v-if="user.role === 'admin'"
                value="Admin"
                severity="danger"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex align-items-center justify-content-center h-full">
          <Button
            label="Napisz do administracji"
            icon="pi pi-send"
            size="large"
            @click="$emit('select-user', 'support')"
          />
        </div>
      </template>
    </div>
  </Dialog>
</template>

<script setup>
defineProps({
  visible: Boolean,
  users: Array,
  loading: Boolean,
  isAdmin: Boolean,
});

defineEmits(["update:visible", "select-user"]);
</script>
