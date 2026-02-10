<template>
  <div v-if="stats" class="grid">
    <div class="col-12 md:col-6 lg:col-3">
      <div
        class="surface-card shadow-1 p-3 border-round border-1 surface-border flex align-items-center gap-3"
      >
        <div
          class="flex align-items-center justify-content-center bg-indigo-100 border-round"
          style="width: 3.5rem; height: 3.5rem"
        >
          <i class="pi pi-users text-indigo-600 text-xl"></i>
        </div>
        <div>
          <span class="block text-900 font-bold text-2xl mb-1">{{
            stats.users?.total || 0
          }}</span>
          <span class="text-600 font-medium text-sm">Użytkowników</span>
        </div>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div
        class="surface-card shadow-1 p-3 border-round border-1 surface-border flex align-items-center gap-3"
      >
        <div
          class="flex align-items-center justify-content-center bg-purple-100 border-round"
          style="width: 3.5rem; height: 3.5rem"
        >
          <i class="pi pi-clock text-purple-600 text-xl"></i>
        </div>
        <div>
          <span class="block text-900 font-bold text-2xl mb-1">{{
            stats.users?.pending || 0
          }}</span>
          <span class="text-600 font-medium text-sm">Oczekujących</span>
        </div>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div
        class="surface-card shadow-1 p-3 border-round border-1 surface-border flex align-items-center gap-3"
      >
        <div
          class="flex align-items-center justify-content-center bg-green-100 border-round"
          style="width: 3.5rem; height: 3.5rem"
        >
          <i class="pi pi-folder text-green-600 text-xl"></i>
        </div>
        <div>
          <span class="block text-900 font-bold text-2xl mb-1">{{
            stats.topics?.total || 0
          }}</span>
          <span class="text-600 font-medium text-sm">Tematów</span>
        </div>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div
        class="surface-card shadow-1 p-3 border-round border-1 surface-border flex align-items-center gap-3"
      >
        <div
          class="flex align-items-center justify-content-center bg-red-100 border-round"
          style="width: 3.5rem; height: 3.5rem"
        >
          <i class="pi pi-ban text-red-600 text-xl"></i>
        </div>
        <div>
          <span class="block text-900 font-bold text-2xl mb-1">{{
            stats.users?.blocked || 0
          }}</span>
          <span class="text-600 font-medium text-sm">Zablokowanych</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="grid">
    <div class="col-12 md:col-6 lg:col-3" v-for="i in 4" :key="i">
      <Skeleton height="5rem" class="border-round" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
