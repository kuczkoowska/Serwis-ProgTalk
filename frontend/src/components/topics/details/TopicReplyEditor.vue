<template>
  <div class="custom-card reply-section mt-3" id="reply-form">
    <div class="mb-3">
      <span>Twoja odpowiedź</span>
    </div>

    <Textarea
      v-model="content"
      rows="3"
      fluid
      placeholder="Napisz coś mądrego..."
      class="reply-textarea"
      autoResize
    />

    <div class="display-end">
      <Button
        label="Wyślij odpowiedź"
        icon="pi pi-send"
        @click="handleSubmit"
        :loading="loading"
        rounded
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  loading: Boolean,
});

const emit = defineEmits(["submit"]);

const content = ref("");

const handleSubmit = () => {
  if (!content.value.trim()) return;

  emit("submit", content.value);

  content.value = "";
};
</script>

<style scoped>
.reply-section {
  padding: 1.5rem;
}

.display-end {
  display: flex;
  justify-content: end;
  margin-top: 1rem;
}
</style>
