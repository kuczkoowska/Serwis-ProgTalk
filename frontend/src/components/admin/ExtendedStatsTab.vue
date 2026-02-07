<template>
  <div class="extended-stats">
    <div v-if="adminStore.loading" class="loading-state">
      <ProgressSpinner strokeWidth="4" />
    </div>

    <div v-else class="stats-content">
      <Card class="stat-card">
        <template #title>
          <div class="card-title">Najpopularniejsze tematy</div>
        </template>
        <template #content>
          <DataTable
            :value="stats.popularTopicsByPosts"
            :rows="5"
            size="small"
            stripedRows
          >
            <Column header="Poz." style="width: 3rem">
              <template #body="{ index }">
                <Badge :value="index + 1" :severity="getBadgeSeverity(index)" />
              </template>
            </Column>
            <Column field="name" header="Temat">
              <template #body="{ data }">
                <div class="topic-cell">
                  <router-link :to="`/topic/${data._id}`" class="topic-link">
                    {{ data.name }}
                  </router-link>
                  <span v-if="data.parent" class="parent-topic">
                    ({{ data.parent }})
                  </span>
                </div>
              </template>
            </Column>
            <Column
              field="postsCount"
              header="Liczba postów"
              style="width: 120px; text-align: center"
            >
              <template #body="{ data }">
                <Tag :value="data.postsCount" severity="info" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <Card class="stat-card">
        <template #title>
          <div class="card-title">Najpopularniejsze posty</div>
        </template>
        <template #content>
          <DataTable
            :value="stats.popularPosts"
            :rows="5"
            size="small"
            stripedRows
          >
            <Column header="Poz." style="width: 3rem">
              <template #body="{ index }">
                <Badge :value="index + 1" :severity="getBadgeSeverity(index)" />
              </template>
            </Column>
            <Column header="Treść">
              <template #body="{ data }">
                <div class="post-cell">
                  <span class="post-content" :title="data.content">
                    {{ truncateContent(data.content) }}
                  </span>
                  <small class="post-author text-muted">
                    autor: {{ data.author?.username || "Nieznany" }}
                  </small>
                </div>
              </template>
            </Column>
            <Column
              field="likesCount"
              header="Lajki"
              style="width: 80px; text-align: center"
            >
              <template #body="{ data }">
                <Tag severity="warning" :value="data.likesCount">
                  <i class="pi pi-heart-fill text-xs mr-1"></i>
                  {{ data.likesCount }}
                </Tag>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useAdminStore } from "../../stores/admin";

const adminStore = useAdminStore();

const stats = computed(() => adminStore.extendedStats);

onMounted(() => {
  adminStore.fetchExtendedStats();
});

const getBadgeSeverity = (index) => {
  if (index === 0) return "warning";
  if (index === 1) return "info";
  if (index === 2) return "contrast";
  return "secondary";
};

const truncateContent = (content) => {
  if (!content) return "";
  return content.length > 60 ? content.substring(0, 60) + "..." : content;
};
</script>

<style scoped>
.extended-stats {
  padding: 1rem 0;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  height: 100%;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
}

.card-title i {
  font-size: 1.2rem;
  color: var(--p-primary-color);
}

.topic-link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 600;
}
.topic-link:hover {
  text-decoration: underline;
}

.parent-topic {
  font-size: 0.8rem;
  color: #94a3b8;
  display: block;
}

.post-cell {
  display: flex;
  flex-direction: column;
}
.post-content {
  font-size: 0.95rem;
  color: #334155;
}
.text-muted {
  color: #94a3b8;
  font-size: 0.85rem;
}
</style>
