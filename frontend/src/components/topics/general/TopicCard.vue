<template>
  <Card class="topic-card" @click="$emit('open')">
    <template #header>
      <div class="h-2 bg-primary border-round-top-xl"></div>
    </template>

    <template #title>
      <div class="flex align-items-center gap-3 mb-2">
        <div class="icon-box">
          <i class="pi pi-folder text-xl"></i>
        </div>
        <div class="flex-1 overflow-hidden">
          <span
            class="block text-xl font-bold white-space-nowrap overflow-hidden text-overflow-ellipsis"
            :title="topic.name"
          >
            {{ topic.name }}
          </span>
        </div>
      </div>
      <div class="flex gap-2 mt-2">
        <Tag
          :value="topic.isClosed ? 'Zamknięty' : 'Otwarty'"
          :severity="topic.isClosed ? 'danger' : 'success'"
          rounded
        />
        <Tag v-if="topic.isHidden" value="Ukryty" severity="warning" rounded />
      </div>
    </template>

    <template #footer>
      <div
        class="flex justify-content-between align-items-center pt-3 border-top-1 border-gray-100 mt-2 text-sm text-gray-600"
      >
        <div class="flex align-items-center gap-2">
          <Avatar
            :label="topic.creator?.username?.[0]?.toUpperCase() || '?'"
            shape="circle"
            size="small"
            class="bg-primary-50 text-primary font-bold"
          />
          <span>{{ topic.creator?.username || "Anonim" }}</span>
        </div>
        <div class="flex align-items-center gap-1">
          <i class="pi pi-calendar"></i>
          <span>{{ new Date(topic.createdAt).toLocaleDateString() }}</span>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
defineProps({
  topic: { required: true, type: Object },
});
defineEmits(["open"]);
</script>

<style scoped>
.topic-card {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: 1px solid var(--surface-border);
}

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow);
  border-color: var(--primary-color);
}

.icon-box {
  width: 40px;
  height: 40px;
  background: var(--primary-50);
  color: var(--primary-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
