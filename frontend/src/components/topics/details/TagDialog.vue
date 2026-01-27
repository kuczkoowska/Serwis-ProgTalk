<template>
  <Dialog
    :visible="visible"
    modal
    header="Dodaj nowy tag"
    :style="{ width: '400px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="dialog-content">
      <div class="input-group">
        <label for="tagName">Nazwa tagu</label>
        <InputText
          id="tagName"
          v-model="newTag.name"
          placeholder="np. pytanie, bug, feature"
        />
      </div>

      <div class="input-group">
        <label for="tagColor">Kolor</label>
        <div class="color-picker">
          <ColorPicker v-model="newTag.color" format="hex" />
          <span
            class="color-preview"
            :style="{ background: '#' + newTag.color }"
          >
            {{ newTag.color }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Anuluj" text @click="$emit('update:visible', false)" />
      <Button label="Dodaj tag" @click="handleCreate" :loading="creating" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useTagsStore } from "../../../stores/tags.js";

const props = defineProps({
  visible: { type: Boolean, default: false },
  topicId: { type: String, required: true },
});

const emit = defineEmits(["update:visible", "created"]);

const tagsStore = useTagsStore();
const toast = useToast();

const creating = ref(false);
const newTag = ref({
  name: "",
  color: "#3498db",
});

const handleCreate = async () => {
  if (!newTag.value.name.trim()) {
    toast.add({
      severity: "warn",
      summary: "Uwaga",
      detail: "Nazwa tagu nie może być pusta",
      life: 3000,
    });
    return;
  }

  creating.value = true;
  try {
    await tagsStore.createTag(
      props.topicId,
      newTag.value.name,
      "#" + newTag.value.color,
    );
    toast.add({
      severity: "success",
      summary: "Sukces",
      detail: "Tag został utworzony",
      life: 3000,
    });
    emit("update:visible", false);
    emit("created");
    newTag.value = { name: "", color: "#3498db" };
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: err || "Nie udało się utworzyć tagu",
      life: 3000,
    });
  } finally {
    creating.value = false;
  }
};
</script>
<style scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-preview {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  min-width: 100px;
  text-align: center;
}
</style>
