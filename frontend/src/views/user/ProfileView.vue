<template>
  <div class="layout-wrapper max-w-4xl mx-auto p-4">
    <Toast />

    <ProfileHeader
      :user="userStore.profile"
      :stats="userStore.stats"
      :loading="userStore.loading"
    />

    <div class="mt-6">
      <Tabs value="0">
        <TabList>
          <Tab value="0"> <i class="pi pi-list mr-2"></i> Aktywność </Tab>
          <Tab value="1"> <i class="pi pi-cog mr-2"></i> Ustawienia </Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="0">
            <div
              class="surface-card p-5 border-round text-center border-1 surface-border"
            >
              <div class="text-900 text-xl font-medium mb-2">
                Brak aktywności
              </div>
              <p class="text-600 mb-4">
                Tutaj wkrótce pojawi się lista Twoich ostatnich postów.
              </p>
              <Button
                label="Przeglądaj tematy"
                icon="pi pi-search"
                text
                @click="$router.push('/')"
              />
            </div>
          </TabPanel>

          <TabPanel value="1">
            <ProfileSettings :user="userStore.profile" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useUserStore } from "../../stores/user";

const userStore = useUserStore();

onMounted(() => {
  userStore.fetchMyProfile();
});
</script>
