<template>
  <div class="custom-card layout-container mb-3">
    <div class="header-content">
      <AvatarComponent
        :username="user?.username"
        size="xlarge"
        class="text-3xl"
      />

      <div class="user-info-col">
        <div class="usernametag">
          <h1 class="username">{{ user?.username }}</h1>
          <p class="role-tag">
            <Tag :value="user?.role || 'Użytkownik'" severity="info" rounded />
          </p>
        </div>

        <p class="date">
          <i class="pi pi-calendar"></i> Dołączył:
          {{ new Date(user?.createdAt || Date.now()).toLocaleDateString() }}
        </p>
      </div>

      <!-- do pobierania z userem? -->
      <div class="user-stats">
        <div class="stat-box">
          <span class="value">12</span>
          <span class="label">Tematów</span>
        </div>
        <div class="stat-box">
          <span class="value">48</span>
          <span class="label">Postów</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AvatarComponent from "../AvatarComponent.vue";

defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<style scoped>
.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.username {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #1e293b;
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
.usernametag {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
