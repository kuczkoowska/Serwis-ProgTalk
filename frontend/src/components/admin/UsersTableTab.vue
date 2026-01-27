<template>
  <div>
    <DataTable
      :value="users"
      :loading="loading"
      paginator
      :rows="10"
      stripedRows
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
          <Button
            v-if="!data.isBlocked"
            icon="pi pi-ban"
            severity="danger"
            text
            rounded
            @click="openBlockDialog(data)"
          />
          <Button
            v-else
            icon="pi pi-unlock"
            severity="success"
            text
            rounded
            @click="handleUnblock(data._id)"
          />
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
import axios from "axios";
import BlockUserDialog from "./BlockUserDialog.vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const users = ref([]);
const loading = ref(false);
const showDialog = ref(false);
const selectedUser = ref(null);
const emit = defineEmits(["status-changed"]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await axios.get("/api/admin/users");
    users.value = res.data.data.users;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail: "Nie udało się pobrać użytkowników",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const openBlockDialog = (user) => {
  selectedUser.value = user;
  showDialog.value = true;
};

const onUserBlocked = () => {
  fetchData();
  emit("status-changed");
};

const handleUnblock = async (id) => {
  try {
    await axios.patch(`/api/admin/users/${id}/unblock`);
    await fetchData();
    emit("status-changed");
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Błąd",
      detail:
        err.response?.data?.message || "Nie udało się odblokować użytkownika",
      life: 3000,
    });
  }
};

onMounted(fetchData);
defineExpose({ refresh: fetchData });
</script>
