<template>
  <div
    class="surface-card p-4 border-round shadow-1 border-1 surface-border flex flex-column md:flex-row gap-4"
  >
    <div class="flex-shrink-0 flex justify-content-center">
      <Avatar
        :label="user?.username?.charAt(0).toUpperCase() || '?'"
        size="xlarge"
        shape="circle"
        class="text-3xl bg-primary-50 text-primary font-bold w-6rem h-6rem"
      />
    </div>

    <div class="flex-1">
      <div
        class="flex flex-column md:flex-row align-items-start md:align-items-center gap-3 mb-2"
      >
        <h1 class="text-3xl font-bold m-0 text-900">{{ user?.username }}</h1>
        <Tag
          :value="getRoleLabel(user?.role)"
          :severity="getRoleSeverity(user?.role)"
          rounded
        />
      </div>

      <p v-if="user?.bio" class="text-600 line-height-3 mt-0 mb-3 max-w-30rem">
        {{ user.bio }}
      </p>

      <div class="flex gap-4 text-sm text-500">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-calendar"></i>
          <span>Dołączył: {{ formatDate(user?.createdAt) }}</span>
        </div>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-envelope"></i>
          <span>{{ user?.email }}</span>
        </div>
      </div>
    </div>

    <div
      class="flex md:flex-column gap-4 md:gap-2 justify-content-center md:text-right border-top-1 md:border-top-none md:border-left-1 border-gray-200 pt-3 md:pt-0 md:pl-4"
    >
      <div class="flex flex-column align-items-center md:align-items-end">
        <span class="text-2xl font-bold text-primary">{{
          loading ? "-" : stats.topics
        }}</span>
        <span class="text-xs text-500 uppercase font-semibold">Tematów</span>
      </div>
      <div class="flex flex-column align-items-center md:align-items-end">
        <span class="text-2xl font-bold text-primary">{{
          loading ? "-" : stats.posts
        }}</span>
        <span class="text-xs text-500 uppercase font-semibold">Postów</span>
      </div>
      <div class="flex flex-column align-items-center md:align-items-end">
        <span class="text-2xl font-bold text-primary">{{
          loading ? "-" : stats.likes
        }}</span>
        <span class="text-xs text-500 uppercase font-semibold">Polubień</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: Object,
  stats: Object,
  loading: Boolean,
});

const getRoleLabel = (role) => {
  const labels = {
    admin: "Administrator",
    user: "Użytkownik",
  };
  return labels[role] || "Użytkownik";
};

const getRoleSeverity = (role) => {
  const severities = {
    admin: "danger",
    user: "info",
  };
  return severities[role] || "info";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>
