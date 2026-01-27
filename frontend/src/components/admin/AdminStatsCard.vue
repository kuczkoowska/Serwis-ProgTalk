<template>
  <div v-if="stats" class="stats-grid">
    <Card class="stat-card">
      <template #content>
        <div class="stat-content">
          <div class="stat-icon users"><i class="pi pi-users"></i></div>
          <div class="stat-info">
            <h3>{{ stats.users.total }}</h3>
            <p>Użytkowników</p>
          </div>
        </div>
      </template>
    </Card>
    <Card class="stat-card">
      <template #content>
        <div class="stat-content">
          <div class="stat-icon pending"><i class="pi pi-clock"></i></div>
          <div class="stat-info">
            <h3>{{ stats.users.pending }}</h3>
            <p>Oczekujących</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Object, required: true },
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
</style>
