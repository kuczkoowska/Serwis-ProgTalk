<template>
  <div class="custom-card layout-container">
    <h3>Ustawienia konta</h3>

    <div>
      <div class="field mb-3">
        <label for="email">Email</label>
        <InputText id="email" v-model="form.email" fluid disabled />
        <small>Emaila nie można zmienić.</small>
      </div>

      <!-- haslo pod jakims guzikiem -->

      <div class="field mb-3">
        <label for="bio" class="block font-bold mb-1 text-sm text-gray-600"
          >O mnie</label
        >
        <Textarea
          id="bio"
          v-model="form.bio"
          rows="4"
          fluid
          autoResize
          placeholder="Napisz coś o sobie..."
        />
      </div>

      <div class="flex justify-end mt-4">
        <Button
          label="Zapisz zmiany"
          icon="pi pi-check"
          @click="saveSettings"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";

const props = defineProps(["user"]);
const toast = useToast();
const loading = ref(false);

const form = reactive({
  email: props.user?.email || "",
  bio: props.user?.bio || "",
});

const saveSettings = async () => {
  loading.value = true;

  setTimeout(() => {
    loading.value = false;
    toast.add({
      severity: "success",
      summary: "Zapisano",
      detail: "Profil zaktualizowany",
      life: 3000,
    });
  }, 1000);
};
</script>

<style scoped></style>
