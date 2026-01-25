<template>
  <div class="custom-card reply-section mt-4" id="reply-form">
    <div class="reply-header mb-2">
      <span class="text">Twoja odpowiedź</span>
    </div>

    <Textarea
      v-model="content"
      rows="3"
      fluid
      placeholder="Napisz coś mądrego..."
      class="reply-textarea"
      autoResize
    />

    <div class="flex justify-end mt-2">
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
.custom-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #eef0f2;
}

.reply-section {
  padding: 1.5rem;
  background: #ffffff;
}

.reply-textarea {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  color: #1e293b;
}

.reply-textarea:focus {
  background-color: #fff;
}

.text {
  color: #1e293b;
}
</style>
