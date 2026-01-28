<template>
  <Card class="topic-card" @click="$emit('open')">
    <template #header>
      <div class="card-gradient gradient"></div>
    </template>

    <template #title>
      <div class="card-title">
        <div class="icon-box">
          <i class="pi pi-folder-open"></i>
        </div>
        <span>{{ topic.name }}</span>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <div class="user-info">
          <AvatarComponent :username="topic.creator?.username" size="small" />

          <span class="username">{{
            topic.creator?.username || "Anonim"
          }}</span>
        </div>
        <span class="date">
          <i class="pi pi-calendar" style="font-size: 0.8rem"></i>
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
  },
});

defineEmits(["open"]);
</script>
<style scoped>
.topic-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}
.topic-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
.card-gradient {
  height: 6px;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #343a40;
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
