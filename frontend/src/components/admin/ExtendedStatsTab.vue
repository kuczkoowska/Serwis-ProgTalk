<template>
  <div class="extended-stats">
    <div v-if="adminStore.loading" class="flex justify-content-center p-5">
      <ProgressSpinner strokeWidth="4" />
    </div>

    <div v-else class="grid">
      <div class="col-12 lg:col-6">
        <Card class="h-full">
          <template #title>
            <div class="flex align-items-center gap-2 text-xl">
              <i class="pi pi-star text-primary"></i> Najpopularniejsze tematy
            </div>
          </template>
          <template #content>
            <DataTable
              :value="adminStore.extendedStats.popularTopicsByPosts"
              size="small"
            >
              <Column header="#" style="width: 3rem">
                <template #body="{ index }">{{ index + 1 }}</template>
              </Column>
              <Column field="name" header="Temat">
                <template #body="{ data }">
                  <router-link
                    :to="`/topic/${data._id}`"
                    class="text-primary no-underline font-bold hover:underline"
                  >
                    {{ data.name }}
                  </router-link>
                </template>
              </Column>
              <Column field="postsCount" header="Posty" class="text-right">
                <template #body="{ data }">
                  <Tag :value="data.postsCount" severity="info" />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-6">
        <Card class="h-full">
          <template #title>
            <div class="flex align-items-center gap-2 text-xl">
              <i class="pi pi-heart text-red-500"></i> Najlepsze posty
            </div>
          </template>
          <template #content>
            <DataTable
              :value="adminStore.extendedStats.popularPosts"
              size="small"
            >
              <Column header="Autor">
                <template #body="{ data }">
                  <div class="flex align-items-center gap-2">
                    <Avatar
                      :label="data.author?.username?.[0]"
                      shape="circle"
                      size="small"
                    />
                    <span class="text-sm font-semibold">{{
                      data.author?.username
                    }}</span>
                  </div>
                </template>
              </Column>
              <Column header="Treść">
                <template #body="{ data }">
                  <span
                    class="text-sm text-600 block white-space-nowrap overflow-hidden text-overflow-ellipsis"
                    style="max-width: 200px"
                  >
                    {{ data.content }}
                  </span>
                </template>
              </Column>
              <Column field="likesCount" header="Lajki" class="text-right">
                <template #body="{ data }">
                  <Tag
                    :value="data.likesCount"
                    severity="warning"
                    icon="pi pi-heart-fill"
                  />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAdminStore } from "../../stores/admin";

const adminStore = useAdminStore();

onMounted(() => {
  adminStore.fetchExtendedStats();
});
</script>
