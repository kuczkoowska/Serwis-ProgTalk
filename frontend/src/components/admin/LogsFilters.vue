<template>
  <div class="logs-filters">
    <Select
      v-model="selectedActionType"
      :options="actionTypeOptions"
      optionLabel="label"
      optionValue="value"
      placeholder="Filtruj po typie akcji"
      showClear
      class="filter-select"
      @change="handleFilterChange"
    />
    <Button
      icon="pi pi-refresh"
      label="Odśwież"
      severity="secondary"
      @click="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  actionTypes: {
    type: Object,
    default: () => ({}),
  },
  actionLabels: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["filter-change", "refresh"]);

const selectedActionType = ref(null);

const actionTypeOptions = ref([]);

watch(
  () => [props.actionTypes, props.actionLabels],
  () => {
    if (Object.keys(props.actionTypes).length > 0) {
      actionTypeOptions.value = Object.entries(props.actionTypes).map(
        ([key, value]) => ({
          label: props.actionLabels[value] || value,
          value: value,
        }),
      );
    }
  },
  { immediate: true, deep: true },
);

const handleFilterChange = () => {
  emit("filter-change", selectedActionType.value);
};

const handleRefresh = () => {
  emit("refresh", selectedActionType.value);
};
</script>

<style scoped>
.logs-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}
.filter-select {
  min-width: 250px;
}
</style>
