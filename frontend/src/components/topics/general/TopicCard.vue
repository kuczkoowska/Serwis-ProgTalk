<template>
  <Card class="topic-card" @click="$emit('open')">
    <template #header>
      <div class="card-gradient"></div>
    </template>

    <template #title>
      <div class="card-title">
        <div class="icon-box">
          <i class="pi pi-folder-open"></i>
        </div>
        <span class="topic-name" :title="topic.name">{{ topic.name }}</span>
      </div>
      <div class="status-tags">
        <Tag
          :value="topic.isClosed ? 'Zamknięty' : 'Otwarty'"
          :severity="topic.isClosed ? 'danger' : 'success'"
          rounded
        />
        <Tag
          v-if="topic.isHidden"
          value="Ukryty"
          severity="warning"
          rounded
          class="ml-2"
        />
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <div class="user-info">
          <Avatar
            v-if="topic.creator?.username"
            :label="topic.creator.username[0].toUpperCase()"
            shape="circle"
            size="normal"
            style="background-color: #ece9fc; color: #2a1261"
          />
          <span class="username">{{
            topic.creator?.username || "Anonim"
          }}</span>
        </div>
        <span class="date">
          <i class="pi pi-calendar"></i>
          {{ new Date(topic.createdAt).toLocaleDateString() }}
        </span>
      </div>
    </template>
  </Card>
</template>

<script setup>
defineProps({
  topic: {
    required: true,
    type: Object,
  },
});

defineEmits(["open"]);
</script>

<style scoped>
.topic-card {
  border: none;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  background: white;
  border: 1px solid #f1f5f9;
}

.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-light);
}

.card-gradient {
  height: 6px;
  background: linear-gradient(
    90deg,
    var(--gradient-start) 0%,
    var(--gradient-end) 100%
  );
}

.icon-box {
  width: 40px;
  height: 40px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-dark);
}

.topic-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tags {
  margin-top: 0.75rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  margin-top: 1rem;
}
</style>
