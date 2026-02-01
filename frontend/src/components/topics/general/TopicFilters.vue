<template>
  <div class="search-section">
    <div class="search-row">
      <IconField iconPosition="left" class="search-input">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="localFilters.search"
          placeholder="Szukaj po nazwie tematu..."
          @input="onSearchInput"
        />
      </IconField>

      <Select
        v-model="localFilters.sort"
        :options="sortOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Sortuj"
        @change="emitChange"
        class="sort-select"
      />
    </div>

    <div class="filter-options">
      <div class="checkbox-wrapper">
        <Checkbox
          v-model="localFilters.showAllLevels"
          inputId="showAllLevels"
          :binary="true"
          @change="emitChange"
        />
        <label for="showAllLevels" class="checkbox-label">
          Pokazuj podtematy
        </label>
      </div>

      <Button
        v-if="hasActiveFilters"
        label="Wyczyść filtry"
        icon="pi pi-times"
        size="small"
        text
        @click="clearFilters"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  // Przyjmujemy początkowe wartości z rodzica
  initialFilters: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:filters", "change"]);

// Kopiujemy propsy do lokalnego stanu, żeby nie mutować ich bezpośrednio
const localFilters = ref({ ...props.initialFilters });

const sortOptions = [
  { label: "Najnowsze", value: "newest" },
  { label: "Najstarsze", value: "oldest" },
  { label: "Nazwa A-Z", value: "name" },
];

let searchTimeout = null;

// Obliczamy czy są aktywne filtry
const hasActiveFilters = computed(() => {
  return (
    localFilters.value.search ||
    localFilters.value.sort !== "newest" ||
    localFilters.value.showAllLevels
  );
});

// Obsługa wpisywania (debounce)
const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emitChange();
  }, 500);
};

// Emitujemy zmianę do rodzica
const emitChange = () => {
  emit("change", localFilters.value);
};

const clearFilters = () => {
  localFilters.value = {
    search: "",
    tags: [],
    sort: "newest",
    showAllLevels: false,
  };
  emitChange();
};

// Synchronizacja w drugą stronę (jeśli rodzic zresetuje filtry)
watch(
  () => props.initialFilters,
  (newVal) => {
    localFilters.value = { ...newVal };
  },
  { deep: true },
);
</script>

<style scoped>
.search-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.search-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.sort-select {
  width: 180px;
}

.filter-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
}

.checkbox-label {
  cursor: pointer;
  user-select: none;
}
</style>
