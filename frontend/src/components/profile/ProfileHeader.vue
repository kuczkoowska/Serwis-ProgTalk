<template>
  <div class="custom-card layout-container mb-3">
    <div class="header-content">
      <Avatar
        :label="user?.username?.charAt(0).toUpperCase()"
        size="xlarge"
        class="text-3xl"
      />

      <div class="user-info-col">
        <div class="usernametag">
          <h1 class="username">{{ user?.username }}</h1>
          <Tag
            :value="getRoleLabel(user?.role)"
            :severity="getRoleSeverity(user?.role)"
            rounded
          />
        </div>

        <p class="bio" v-if="user?.bio">{{ user.bio }}</p>

        <div class="user-meta">
          <span class="meta-item">
            <i class="pi pi-calendar"></i>
            Dołączył: {{ formatDate(user?.createdAt) }}
          </span>
          <span class="meta-item">
            <i class="pi pi-envelope"></i>
            {{ user?.email }}
          </span>
        </div>
      </div>

      <div class="user-stats">
        <div class="stat-box">
          <Skeleton v-if="loading" width="3rem" height="1.5rem" />
          <span v-else class="value">{{ stats.topics }}</span>
          <span class="label">Tematów</span>
        </div>
        <div class="stat-box">
          <Skeleton v-if="loading" width="3rem" height="1.5rem" />
          <span v-else class="value">{{ stats.posts }}</span>
          <span class="label">Postów</span>
        </div>
        <div class="stat-box">
          <Skeleton v-if="loading" width="3rem" height="1.5rem" />
          <span v-else class="value">{{ stats.likes }}</span>
          <span class="label">Polubień</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  stats: {
    type: Object,
    default: () => ({ topics: 0, posts: 0, likes: 0 }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
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

<style scoped>
.header-content {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
}

.user-info-col {
  flex: 1;
}

.usernametag {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.username {
  margin: 0;
  font-size: 2rem;
  color: #1e293b;
}

.bio {
  color: #475569;
  margin: 0.5rem 0 1rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.user-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.meta-item i {
  color: #94a3b8;
}

.user-stats {
  margin-left: auto;
  display: flex;
  gap: 2rem;
}

.stat-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  min-width: 70px;
}

.stat-box .value {
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--p-primary-color);
}

.stat-box .label {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
