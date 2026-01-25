<!-- nie wiem jeszcze czy uzyje ale mzoe byc fajna opcja?? moze tylko dla admina -->

<template>
  <div class="custom-card mt-3">
    <div class="sidebar-header">
      <i class="pi pi-chart-bar text-primary"></i>
      <span>Statystyki</span>
    </div>
    <div class="sidebar-content">
      <div class="stat-row">
        <span class="text-gray">Liczba postów</span>
        <span class="stat-value">{{ postsCount }}</span>
      </div>
      <div class="stat-row">
        <span class="text-gray">Obserwujących</span>
        <span class="stat-value">0</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  postsCount: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
.text-gray {
  color: #475569;
}
.custom-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #eef0f2;
}

.sidebar-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.sidebar-content {
  padding: 1.25rem;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}
.stat-value {
  font-weight: 700;
  color: #1e293b;
}
</style>
