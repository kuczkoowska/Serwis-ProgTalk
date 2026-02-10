<template>
  <div class="surface-card p-3 border-round shadow-1 border-1 surface-border">
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
      <small class="text-gray-500">
        <i class="pi pi-info-circle mr-1"></i>
        Możesz używać Markdown (np. **pogrubienie**, ```kod```)
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
import { ref } from "vue";

const props = defineProps({
  loading: Boolean,
  placeholder: String,
});

const emit = defineEmits(["submit"]);

const content = ref("");

const handleSubmit = () => {
  if (!content.value.trim()) return;
  emit("submit", content.value);
  content.value = "";
};
</script>
