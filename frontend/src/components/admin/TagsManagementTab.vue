<template>
  <div class="tags-management">
    <div
      class="surface-card p-4 border-round shadow-1 mb-4 flex flex-column md:flex-row gap-3 align-items-end"
    >
      <div class="flex-grow-1 w-full">
        <label for="tagName" class="block font-bold mb-2 text-700"
          >Nowy tag</label
        >
        <InputText
          id="tagName"
          v-model="newTagName"
          placeholder="Np. JavaScript, Ogłoszenia..."
          class="w-full"
          @keyup.enter="handleCreate"
        />
      </div>
      <Button
        label="Dodaj Tag"
        icon="pi pi-plus"
        @click="handleCreate"
        :loading="creating"
        :disabled="!newTagName.trim()"
      />
    </div>

    <DataTable
      :value="tagsStore.allTags"
      :loading="tagsStore.loading"
      stripedRows
      paginator
      :rows="10"
      class="p-datatable-sm"
      responsiveLayout="scroll"
    >
      <template #empty>
        <div class="text-center p-4 text-500">Brak tagów w systemie.</div>
      </template>

      <Column header="Podgląd" style="width: 150px">
        <template #body="{ data }">
          <span
            class="px-2 py-1 border-round text-sm font-medium text-white white-space-nowrap"
            :style="{ backgroundColor: data.color || '#64748b' }"
          >
            #{{ data.name }}
          </span>
        </template>
      </Column>

      <Column field="name" header="Nazwa" sortable></Column>

      <Column field="usageCount" header="Użycie" sortable style="width: 120px">
        <template #body="{ data }">
          <Badge :value="data.usageCount || 0" severity="info" />
        </template>
      </Column>

      <Column header="Akcje" style="width: 100px; text-align: right">
        <template #body="{ data }">
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            @click="confirmDelete(data)"
            v-tooltip.top="'Usuń tag'"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="deleteDialog"
      header="Potwierdź usunięcie"
      modal
      :style="{ width: '400px' }"
    >
      <div class="flex align-items-center gap-3 mb-3">
        <i class="pi pi-exclamation-triangle text-orange-500 text-3xl"></i>
        <span>
          Czy na pewno chcesz usunąć tag <b>#{{ tagToDelete?.name }}</b
          >?
          <br />
          <small class="text-500"
            >Zostanie on odpięty ze wszystkich tematów.</small
          >
        </span>
      </div>
      <template #footer>
        <Button
          label="Anuluj"
          text
          severity="secondary"
          @click="deleteDialog = false"
        />
        <Button
          label="Usuń"
          severity="danger"
          icon="pi pi-trash"
          @click="handleDelete"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTagsStore } from "../../stores/tags";
import { useToastHelper } from "../../composables/useToastHelper";

const tagsStore = useTagsStore();
const { showSuccess, showError } = useToastHelper();

const newTagName = ref("");
const creating = ref(false);
const deleting = ref(false);
const deleteDialog = ref(false);
const tagToDelete = ref(null);

onMounted(() => {
  tagsStore.fetchTags();
});

const handleCreate = async () => {
  if (!newTagName.value.trim()) return;

  creating.value = true;
  try {
    await tagsStore.createTag(newTagName.value.trim());
    showSuccess(`Tag "${newTagName.value}" został utworzony`);
    newTagName.value = "";
  } catch (err) {
    showError(err);
  } finally {
    creating.value = false;
  }
};

const confirmDelete = (tag) => {
  tagToDelete.value = tag;
  deleteDialog.value = true;
};

const handleDelete = async () => {
  if (!tagToDelete.value) return;

  deleting.value = true;
  try {
    await tagsStore.deleteTag(tagToDelete.value._id);
    showSuccess("Tag został usunięty");
    deleteDialog.value = false;
    tagToDelete.value = null;
  } catch (err) {
    showError(err);
  } finally {
    deleting.value = false;
  }
};
</script>
