<template>
  <div v-if="stats" class="stats-grid">
    <Card class="stat-card">
      <template #content>
        <div class="stat-content">
          <div class="stat-icon users">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.users?.total || 0 }}</h3>
            <p class="stat-label">Użytkowników</p>
          </div>
        </div>
      </template>
    </Card>

    <Card class="stat-card">
      <template #content>
        <div class="stat-content">
          <div class="stat-icon pending">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.users?.pending || 0 }}</h3>
            <p class="stat-label">Oczekujących</p>
          </div>
        </div>
      </template>
    </Card>

    <Card class="stat-card">
      <template #content>
        <div class="stat-content">
          <div class="stat-icon topic">
            <i class="pi pi-folder"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.topics?.total || 0 }}</h3>
            <p class="stat-label">Tematów</p>
          </div>
        </div>
      </template>
    </Card>

    <Card class="stat-card">
      <template #content>
        <div class="stat-content">
          <div class="stat-icon blocked">
            <i class="pi pi-ban"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.users?.blocked || 0 }}</h3>
            <p class="stat-label">Zablokowanych</p>
          </div>
        </div>
      </template>
    </Card>
  </div>

  <div v-else class="stats-grid">
    <Skeleton height="100px" class="stat-card" v-for="i in 4" :key="i" />
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

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.stat-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.users {
  background: #667eea;
}

.stat-icon.pending {
  background: #f093fb;
}

.stat-icon.topic {
  background: #43e97b;
}
.stat-icon.blocked {
  background: #ef4444;
}
</style>
