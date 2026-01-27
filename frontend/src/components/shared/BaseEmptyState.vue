<template>
  <div class="empty-state-card custom-card">
    <div class="icon-wrapper">
      <i
        :class="['pi', icon]"
        style="font-size: 2.5rem; color: var(--p-primary-color)"
      ></i>
    </div>

    <h3 class="title">{{ title }}</h3>
    <p class="description">{{ description }}</p>

    <div class="actions" v-if="$slots.default">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "Nic tu nie ma",
  },
  description: {
    type: String,
    default: "Wygląda na to, że ta lista jest pusta.",
  },
  icon: {
    type: String,
    default: "pi-inbox",
  },
});
</script>

<style scoped>
.empty-state-card {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #eef0f2;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.title {
  margin: 0 0 0.5rem 0;
  color: #334155;
  font-size: 1.5rem;
}

.description {
  color: #64748b;
  margin: 0 0 2rem 0;
  max-width: 400px;
  line-height: 1.6;
}
</style>
