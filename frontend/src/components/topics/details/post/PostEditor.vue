<template>
  <div class="surface-card p-3 border-round shadow-1 border-1 surface-border">
    <div v-if="tagsStore.topicTags.length > 0" class="mb-3">
      <label class="text-xs font-bold text-600 uppercase mb-2 block">
        <i class="pi pi-tags mr-1"></i> Oznacz post (opcjonalne):
      </label>

      <div class="flex flex-wrap gap-2">
        <div
          v-for="tag in tagsStore.topicTags"
          :key="tag._id"
          class="cursor-pointer border-round px-2 py-1 text-sm transition-colors border-1 select-none"
          :class="{
            'font-bold shadow-1': selectedTags.includes(tag._id),
            'surface-border text-600 bg-surface-0 hover:surface-100':
              !selectedTags.includes(tag._id),
          }"
          :style="
            selectedTags.includes(tag._id)
              ? {
                  backgroundColor: tag.color,
                  borderColor: tag.color,
                  color: 'white',
                }
              : {}
          "
          @click="toggleTag(tag._id)"
        >
          <span v-if="selectedTags.includes(tag._id)" class="mr-1">✓</span>
          <span v-else>#</span>
          {{ tag.name }}
        </div>
      </div>
    </div>

    <div class="mb-2">
      <Textarea
        v-model="content"
        rows="4"
        class="w-full"
        :placeholder="placeholder || 'Napisz coś w tym temacie...'"
        autoResize
        style="resize: none"
      />
    </div>

    <div class="flex justify-content-between align-items-center">
      <small class="text-gray-500 hidden md:block">
        <i class="pi pi-info-circle mr-1"></i>
        ```block```
      </small>

      <Button
        label="Wyślij"
        icon="pi pi-send"
        :loading="loading"
        :disabled="!content.trim()"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useTagsStore } from "../../../../stores/tags";

const props = defineProps({
  loading: Boolean,
  placeholder: String,
});

const emit = defineEmits(["submit"]);

const route = useRoute();
const tagsStore = useTagsStore();
const content = ref("");
const selectedTags = ref([]);

onMounted(() => {
  if (route.params.id) {
    tagsStore.fetchTagsForTopic(route.params.id);
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      tagsStore.fetchTagsForTopic(newId);
      selectedTags.value = [];
    }
  },
);

const toggleTag = (tagId) => {
  const index = selectedTags.value.indexOf(tagId);
  if (index === -1) {
    selectedTags.value.push(tagId);
  } else {
    selectedTags.value.splice(index, 1);
  }
};

const handleSubmit = () => {
  if (!content.value.trim()) return;

  emit("submit", {
    content: content.value,
    tags: selectedTags.value,
  });

  content.value = "";
  selectedTags.value = [];
};
</script>
