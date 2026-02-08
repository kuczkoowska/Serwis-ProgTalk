<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :header="isClosed ? 'Otwórz temat' : 'Zamknij temat'"
    :style="{ width: '28rem' }"
  >
    <div class="flex flex-col gap-3">
      <p>
        {{
          isClosed
            ? `Czy na pewno chcesz otworzyć temat "${topicName}"?`
            : `Czy na pewno chcesz zamknąć temat "${topicName}"?`
        }}
      </p>

      <div class="flex items-center gap-2">
        <Checkbox
          v-model="includeSubtopics"
          inputId="includeSubtopics"
          :binary="true"
        />
        <label for="includeSubtopics">
          {{
            isClosed
              ? "Otwórz również wszystkie podtematy"
              : "Zamknij również wszystkie podtematy"
          }}
        </label>
      </div>
    </div>

    <template #footer>
      <Button label="Anuluj" severity="secondary" text @click="closeDialog" />
      <Button
        :label="isClosed ? 'Otwórz' : 'Zamknij'"
        :severity="isClosed ? 'success' : 'warning'"
        :icon="isClosed ? 'pi pi-lock-open' : 'pi pi-lock'"
        @click="confirm"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  topicName: { type: String, default: "" },
  isClosed: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible", "confirm"]);

const includeSubtopics = ref(false);
const loading = ref(false);

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        includeSubtopics.value = false;
      }, 300);
    }
  },
);

const closeDialog = () => {
  emit("update:visible", false);
};

const confirm = () => {
  emit("confirm", includeSubtopics.value);
};
</script>
