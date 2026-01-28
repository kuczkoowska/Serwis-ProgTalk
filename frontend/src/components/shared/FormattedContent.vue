<template>
  <div class="formatted-content" v-html="formattedHtml"></div>
</template>

<script setup>
import { computed } from "vue";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const props = defineProps({
  content: { type: String, required: true },
});

const formattedHtml = computed(() => {
  let text = props.content;

  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || "plaintext";
    try {
      const highlighted = hljs.highlight(code.trim(), { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    } catch (e) {
      const highlighted = hljs.highlightAuto(code.trim()).value;
      return `<pre><code class="hljs">${highlighted}</code></pre>`;
    }
  });

  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  text = text.replace(/\n/g, "<br>");

  return text;
});
</script>

<style scoped>
.formatted-content {
  word-wrap: break-word;
  white-space: normal;
}

.formatted-content :deep(pre) {
  background: #0d1117;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.formatted-content :deep(code.hljs) {
  background: transparent;
  padding: 0;
}

.formatted-content :deep(.inline-code) {
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
  color: #24292f;
}

.formatted-content :deep(br) {
  content: "";
  display: block;
  margin: 0.25em 0;
}
</style>
