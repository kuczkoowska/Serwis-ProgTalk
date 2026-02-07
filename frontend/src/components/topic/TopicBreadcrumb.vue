<template>
  <div class="breadcrumb-section">
    <Breadcrumb :home="homeItem" :model="breadcrumbItems" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  topic: {
    type: Object,
    required: true
  },
  homeItem: {
    type: Object,
    required: true
  }
});

const breadcrumbItems = computed(() => {
  if (!props.topic) return [];
  const items = [];
  if (props.topic.ancestors?.length > 0) {
    props.topic.ancestors.forEach((ancestor, index) => {
      items.push({
        label: ancestor.name || `Temat ${index + 1}`,
        command: () => router.push(`/topic/${ancestor._id || ancestor}`),
      });
    });
  }
  items.push({ label: props.topic.name });
  return items;
});
</script>

<style scoped>
.breadcrumb-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>