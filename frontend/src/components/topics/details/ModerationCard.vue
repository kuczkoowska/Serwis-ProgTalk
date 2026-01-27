<template>
  <div class="custom-card">
    <div class="sidebar-header">
      <i class="pi pi-shield"></i>
      <span>Panel moderacji</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  topic: { type: Object, required: true },
});
</script>

<style scoped></style>
