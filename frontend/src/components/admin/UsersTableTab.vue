<template>
  <div>
    <DataTable
      :value="adminStore.users"
      :loading="adminStore.loading"
      paginator
      :rows="10"
      stripedRows
      tableStyle="min-width: 50rem"
    >
      <Column field="username" header="Nazwa użytkownika" sortable></Column>
      <Column field="email" header="Email" sortable></Column>
      <Column field="role" header="Rola" sortable>
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.role === 'admin' ? 'Admin' : 'Użytkownik'"
            :severity="slotProps.data.role === 'admin' ? 'danger' : 'info'"
          />
        </template>
      </Column>
      <Column field="isBlocked" header="Status" sortable>
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.isBlocked ? 'Zablokowany' : 'Aktywny'"
            :severity="slotProps.data.isBlocked ? 'danger' : 'success'"
          />
        </template>
      </Column>
      <Column header="Akcje">
        <template #body="{ data }">
          <div class="actions-cell">
            <Button
              v-if="!data.isBlocked"
              icon="pi pi-ban"
              severity="danger"
              text
              rounded
              v-tooltip.top="'Zablokuj'"
              @click="openBlockDialog(data)"
            />
            <Button
              v-else
              icon="pi pi-unlock"
              severity="success"
              text
              rounded
              v-tooltip.top="'Odblokuj'"
              @click="handleUnblock(data._id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <BlockUserDialog
      v-model:visible="showDialog"
      :user="selectedUser"
      @blocked="onUserBlocked"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToastHelper } from "../../composables/useToastHelper";
import { useAdminStore } from "../../stores/admin";
import BlockUserDialog from "./BlockUserDialog.vue";

const { showSuccess, showError } = useToastHelper();
const adminStore = useAdminStore();

const showDialog = ref(false);
const selectedUser = ref(null);

onMounted(() => {
  adminStore.fetchAllUsers();
});

const openBlockDialog = (user) => {
  selectedUser.value = user;
  showDialog.value = true;
};

const handleUnblock = async (id) => {
  try {
    await adminStore.unblockUser(id);
    showSuccess("Użytkownik odblokowany");
  } catch (err) {
    showError(err);
  }
};
</script>
