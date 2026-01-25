<template>
  <div class="custom-card header-card mb-4">
    <div class="header-content">
      <div class="title-section">
        <div class="mb-2">
          <Tag
            :value="topic?.isClosed ? 'Zamknięty' : 'Otwarty'"
            :severity="topic?.isClosed ? 'danger' : 'success'"
            rounded
          />
          <!-- moze osobny komponent??? i mzoe przeniesc w prawy grony rog????? -->
        </div>

        <h1 class="topic-title">{{ topic?.name }}</h1>

        <div class="meta-info">
          <AvatarComponent :username="topic?.creator?.username" size="normal" />
          <div class="meta-text">
            <span class="author-name">{{ topic?.creator?.username }}</span>
            <span class="date">
              utworzono
              {{ new Date(topic?.createdAt).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <Divider />
    <div class="topic-description">
      {{ topic?.description }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  topic: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.custom-card {
  background: #ffffff;
  border-radius: 12px;
}

.header-card {
  padding: 2rem;
}

.topic-title {
  font-size: 2rem;
  color: #1e293b;
  margin: 0.5rem 0 1rem 0;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-text {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 700;
  color: #334155;
  font-size: 0.95rem;
}

.date {
  font-size: 0.8rem;
  color: #94a3b8;
}

.topic-description {
  font-size: 1.05rem;
  color: #475569;
  margin-top: 1rem;
}
</style>
