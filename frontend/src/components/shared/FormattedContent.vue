<template>
  <div class="formatted-content" v-html="formattedHtml"></div>
</template>

<script setup>
import { computed } from "vue";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import DOMPurify from "dompurify";

const props = defineProps({
  content: { type: String, required: true },
});

const escapeHtml = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const formattedHtml = computed(() => {
  let text = props.content;

  const codeBlocks = [];
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || "plaintext";
    let highlighted;
    try {
      highlighted = hljs.highlight(code.trim(), { language }).value;
    } catch (e) {
      highlighted = hljs.highlightAuto(code.trim()).value;
    }
    const placeholder = `%%CODEBLOCK_${codeBlocks.length}%%`;
    codeBlocks.push(
      `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`,
    );
    return placeholder;
  });

  const inlineBlocks = [];
  text = text.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `%%INLINE_${inlineBlocks.length}%%`;
    inlineBlocks.push(`<code class="inline-code">${escapeHtml(code)}</code>`);
    return placeholder;
  });

  text = escapeHtml(text);

  codeBlocks.forEach((block, i) => {
    text = text.replace(`%%CODEBLOCK_${i}%%`, block);
  });
  inlineBlocks.forEach((block, i) => {
    text = text.replace(`%%INLINE_${i}%%`, block);
  });

  text = text.replace(/\n/g, "<br>");

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ["pre", "code", "br", "span"],
    ALLOWED_ATTR: ["class"],
  });
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
