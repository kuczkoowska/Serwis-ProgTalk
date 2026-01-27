<template>
  <span
    class="tag-badge"
    :class="{ 'is-clickable': clickable }"
    :style="computedStyle"
    @click="handleClick"
  >
    {{ tag.name }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  tag: { type: Object, required: true },
  clickable: { type: Boolean, default: false },
  selected: { type: Boolean, default: true },
});

const emit = defineEmits(["click"]);

const computedStyle = computed(() => {
  const color = props.tag.color;

  if (props.selected) {
    return {
      backgroundColor: color,
      border: `2px solid ${color}`,
      color: "white",
      boxShadow: `0 2px 8px ${color}40`,
    };
  }

  return {
    backgroundColor: "transparent",
    border: `2px solid ${color}`,
    color: color,
  };
});

const handleClick = () => {
  if (props.clickable) {
    emit("click", props.tag._id);
  }
};
</script>

<style scoped>
.tag-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  transition: all 0.2s;
}

.is-clickable {
  cursor: pointer;
}

.is-clickable:hover {
  transform: scale(1.05);
}
</style>
