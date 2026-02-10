<template>
  <div
    class="surface-card p-4 border-round shadow-1 mb-4 border-1 surface-border"
  >
    <div class="flex flex-column md:flex-row gap-3 mb-3">
      <IconField iconPosition="left" class="flex-1">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="localSearch"
          placeholder="Szukaj tematu..."
          class="w-full"
          @input="onSearchInput"
        />
      </IconField>

      <Select
        v-model="sortModel"
        :options="sortOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Sortuj"
        class="w-full md:w-15rem"
      />
    </div>

    <div class="flex align-items-center justify-content-between">
      <div class="flex align-items-center gap-2">
        <Checkbox v-model="showAllLevelsModel" inputId="showAllLevels" binary />
        <label for="showAllLevels" class="cursor-pointer text-gray-700">
          Pokaż podtematy
        </label>
      </div>

      <Button
        v-if="hasActiveFilters"
        label="Wyczyść"
        icon="pi pi-times"
        severity="secondary"
        text
        size="small"
        @click="clearFilters"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  filters: { type: Object, required: true },
});

const emit = defineEmits(["update:filters", "change"]);

const sortOptions = [
  { label: "Najnowsze", value: "newest" },
  { label: "Najstarsze", value: "oldest" },
  { label: "Nazwa A-Z", value: "name" },
];

const localSearch = ref(props.filters.search);
let debounceTimer = null;

watch(
  () => props.filters.search,
  (newVal) => {
    localSearch.value = newVal;
  },
);

const onSearchInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateFilter("search", localSearch.value);
  }, 500);
};

const sortModel = computed({
  get: () => props.filters.sort,
  set: (val) => updateFilter("sort", val),
});

const showAllLevelsModel = computed({
  get: () => props.filters.showAllLevels,
  set: (val) => updateFilter("showAllLevels", val),
});

const updateFilter = (key, value) => {
  const newFilters = { ...props.filters, [key]: value };

  emit("update:filters", newFilters);

  emit("change", newFilters);
};

const hasActiveFilters = computed(
  () =>
    props.filters.search ||
    props.filters.sort !== "newest" ||
    props.filters.showAllLevels,
);

const clearFilters = () => {
  localSearch.value = "";
  const resetFilters = {
    search: "",
    tags: [],
    sort: "newest",
    showAllLevels: false,
  };
  emit("update:filters", resetFilters);
  emit("change", resetFilters);
};
</script>
