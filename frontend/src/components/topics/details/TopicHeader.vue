<template>
  <div class="custom-card layout-container mb-3">
    <div>
      <div>
        <div class="mb-3">
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
          <div class="user-info-col">
            <span class="username">{{ topic?.creator?.username }}</span>
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
.topic-title {
  font-size: 2rem;
  color: #1e293b;
  margin: 0.5rem 0 1rem 0;
}

.topic-description {
  font-size: 1.05rem;
  color: #475569;
  margin-top: 1rem;
}
</style>
