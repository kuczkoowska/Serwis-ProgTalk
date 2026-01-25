<template>
  <Avatar
    :label="initial"
    shape="circle"
    :size="size"
    class="user-avatar"
    style="background-color: #dee2e6; color: #495057"
  />
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  username: {
    type: String,
    default: "?",
  },
  size: {
    type: String,
    default: "normal",
  },
});

const initial = computed(() => {
  return props.username ? props.username[0].toUpperCase() : "?";
});
</script>

<style scoped>
.user-avatar {
  font-weight: bold;
}
</style>
