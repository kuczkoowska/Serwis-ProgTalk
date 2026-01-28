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
      rows="5"
      fluid
      placeholder="Napisz odpowiedź..."
    />

    <div class="code-hint">
      <small class="text-muted">
        <i class="pi pi-info-circle"></i>
        Możesz używać bloków kodu: <code>`kod inline`</code> lub
        <code>```javascript kod wielolinijkowy```</code>
      </small>
    </div>

    <div v-if="availableTags.length > 0" class="tags-selector">
      <label>Tagi (opcjonalnie):</label>
      <div class="tags-chips">
        <TagBadge
          v-for="tag in availableTags"
          :key="tag._id"
          :tag="tag"
          clickable
          :selected="selectedTags.includes(tag._id)"
          @click="toggleTag"
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
import TagBadge from "../../shared/TagBadge.vue";

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

.code-hint {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.code-hint .text-muted {
  color: #6c757d;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-hint code {
  background: #e9ecef;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 0.8rem;
}

.display-end {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
