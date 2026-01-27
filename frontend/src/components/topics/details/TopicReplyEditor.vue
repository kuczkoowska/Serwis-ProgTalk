<template>
  <div class="custom-card reply-section mt-3" id="reply-form">
    <div v-if="replyToId" class="replying-to">
      <i class="pi pi-reply"></i>
      <span>Odpowiadasz na wybrany post</span>
      <Button
        icon="pi pi-times"
        class="p-button-text p-button-sm"
        @click="$emit('cancel')"
      />
    </div>

    <Textarea
      v-model="content"
      rows="3"
      fluid
      placeholder="Napisz odpowiedź..."
    />

    <div v-if="availableTags.length > 0" class="tags-selector">
      <label>Tagi (opcjonalnie):</label>
      <div class="tags-chips">
        <Chip
          v-for="tag in availableTags"
          :key="tag._id"
          :label="tag.name"
          :style="{
            background: selectedTags.includes(tag._id)
              ? tag.color
              : 'transparent',
            color: selectedTags.includes(tag._id) ? 'white' : tag.color,
            border: `2px solid ${tag.color}`,
          }"
          @click="toggleTag(tag._id)"
          class="tag-chip"
        />
      </div>
    </div>

    <div class="display-end">
      <Button :loading="loading" label="Wyślij" @click="handleSubmit" rounded />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  loading: Boolean,
  replyToId: String,
  availableTags: { type: Array, default: () => [] },
});
const emit = defineEmits(["submit", "cancel"]);
const content = ref("");
const selectedTags = ref([]);

const toggleTag = (tagId) => {
  const index = selectedTags.value.indexOf(tagId);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tagId);
  }
};

const handleSubmit = () => {
  if (!content.value.trim()) return;
  emit("submit", {
    content: content.value.trim(),
    tags: selectedTags.value,
  });
  content.value = "";
  selectedTags.value = [];
};
</script>

<style scoped>
.reply-section {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.replying-to {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border-left: 3px solid var(--p-primary-color);
  border-radius: 6px;
  margin-bottom: 1rem;
  color: #334155;
  font-size: 0.9rem;
}

.replying-to i {
  color: var(--p-primary-color);
}

.replying-to span {
  flex: 1;
}

.tags-selector {
  margin-top: 1rem;
}

.tags-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
}

.tags-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.tag-chip:hover {
  transform: scale(1.05);
}

.display-end {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
