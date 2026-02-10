<template>
  <div>
    <div
      v-if="adminStore.loading && adminStore.pendingUsers.length === 0"
      class="flex justify-content-center p-5"
    >
      <ProgressSpinner />
    </div>

    <div
      v-else-if="adminStore.pendingUsers.length === 0"
      class="text-center p-5 text-600"
    >
      <i class="pi pi-check-circle text-green-500 text-6xl mb-3"></i>
      <p class="text-xl m-0">
        Wszystko wyczyszczone! Brak oczekujących użytkowników.
      </p>
    </div>

    <div v-else class="grid">
      <div
        class="col-12 md:col-6 lg:col-4 xl:col-3"
        v-for="user in adminStore.pendingUsers"
        :key="user._id"
      >
        <div
          class="surface-card shadow-2 p-0 border-round h-full flex flex-column"
        >
          <div class="p-3 flex align-items-center gap-3">
            <Avatar
              :label="user.username.charAt(0).toUpperCase()"
              shape="circle"
              size="large"
              class="bg-orange-100 text-orange-700 font-bold"
            />
            <div class="flex-1 overflow-hidden">
              <span
                class="block font-bold text-900 text-lg mb-1 white-space-nowrap text-overflow-ellipsis"
                >{{ user.username }}</span
              >
              <span
                class="block text-600 text-sm mb-1 white-space-nowrap text-overflow-ellipsis"
                >{{ user.email }}</span
              >
              <div class="text-xs text-500">
                <i class="pi pi-calendar mr-1"></i>
                {{ formatDate(user.createdAt) }}
              </div>
            </div>
          </div>

          <div
            class="mt-auto p-3 border-top-1 surface-border flex justify-content-between gap-2"
          >
            <Button
              label="Odrzuć"
              icon="pi pi-times"
              severity="danger"
              outlined
              size="small"
              class="flex-1"
              @click="handleReject(user._id)"
              :loading="processingId === user._id"
            />
            <Button
              label="Zatwierdź"
              icon="pi pi-check"
              severity="success"
              size="small"
              class="flex-1"
              @click="handleApprove(user._id)"
              :loading="processingId === user._id"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToastHelper } from "../../composables/useToastHelper";
import { useAdminStore } from "../../stores/admin";

const { showSuccess, showError, showInfo } = useToastHelper();
const adminStore = useAdminStore();
const processingId = ref(null);

onMounted(() => {
  adminStore.fetchPendingUsers();
});

const handleApprove = async (id) => {
  processingId.value = id;
  try {
    await adminStore.approveUser(id);
    showSuccess("Użytkownik aktywowany");
  } catch (err) {
    showError(err);
  } finally {
    processingId.value = null;
  }
};

const handleReject = async (id) => {
  processingId.value = id;
  try {
    await adminStore.rejectUser(id, "Odrzucony przez administratora");
    showInfo("Użytkownik usunięty");
  } catch (err) {
    showError(err);
  } finally {
    processingId.value = null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("pl-PL", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
