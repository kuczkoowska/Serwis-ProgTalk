<template>
  <div class="custom-card">
    <div class="sidebar-header">
      <i class="pi pi-sitemap"></i>
      <span>Podtematy</span>
    </div>

    <div class="sidebar-content">
      <ul class="subtopics-list" v-if="subtopics.length > 0">
        <li v-for="sub in subtopics" :key="sub._id" @click="goToTopic(sub._id)">
          <div class="subtopic-name">
            <i class="pi pi-hashtag"></i>
            {{ sub.name }}
          </div>
          <i class="pi pi-angle-right"></i>
        </li>
      </ul>

      <div v-else>Brak poddziałów.</div>

      <Button
        label="Utwórz podtemat"
        size="small"
        severity="secondary"
        outlined
        fluid
        icon="pi pi-plus"
        @click="$emit('create')"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

defineProps({
  subtopics: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["create"]);

const router = useRouter();

const goToTopic = (id) => {
  router.push(`/topic/${id}`);
};
</script>

<style scoped>
.subtopics-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #334155;
  font-weight: 500;
}

.subtopics-list li:hover {
  background-color: #f1f5f9;
  color: var(--p-primary-color);
}
</style>
