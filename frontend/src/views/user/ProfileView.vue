<template>
  <div class="layout-wrapper">
    <Toast />

    <div class="main-container">
      <ProfileHeader :user="authStore.user" />

      <div class="content-section">
        <Tabs value="0">
          <TabList>
            <Tab value="0"> <i class="pi pi-list mr-2"></i> Aktywność </Tab>
            <Tab value="1"> <i class="pi pi-cog mr-2"></i> Ustawienia </Tab>
          </TabList>

          <TabPanels>
            <TabPanel value="0">
              <BaseEmptyState
                title="Brak aktywności"
                description="Tutaj wkrótce pojawi się lista Twoich ostatnich postów."
                icon="pi pi-inbox"
              >
                <Button
                  label="Przeglądaj tematy"
                  text
                  @click="$router.push('/')"
                />
              </BaseEmptyState>
            </TabPanel>

            <TabPanel value="1">
              <ProfileSettings :user="authStore.user" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
</script>

<style scoped>
:deep(.p-tablist) {
  background: transparent;
  margin-bottom: 1.5rem;
}
</style>
