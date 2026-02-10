<template>
  <div class="surface-card p-4 border-round shadow-1 border-1 surface-border">
    <div class="flex flex-column gap-3">
      <div class="flex gap-2">
        <Tag
          :value="topic?.isClosed ? 'Zamknięty' : 'Otwarty'"
          :severity="topic?.isClosed ? 'danger' : 'success'"
          rounded
          icon="pi pi-circle-fill"
        />
        <Tag
          v-if="topic?.isHidden"
          value="Ukryty"
          severity="warning"
          rounded
          icon="pi pi-eye-slash"
        />
      </div>

      <h1 class="text-3xl font-bold text-900 m-0">{{ topic?.name }}</h1>

      <div class="flex align-items-center gap-3 text-sm text-600">
        <div class="flex align-items-center gap-2">
          <Avatar
            :label="topic?.creator?.username?.charAt(0).toUpperCase()"
            shape="circle"
            size="small"
          />
          <span class="font-semibold">{{
            topic?.creator?.username || "Anonim"
          }}</span>
        </div>
        <span>&bull;</span>
        <div class="flex align-items-center gap-1">
          <i class="pi pi-calendar"></i>
          <span>{{ new Date(topic?.createdAt).toLocaleDateString() }}</span>
        </div>
      </div>

      <Divider />

      <div class="text-700 line-height-3">
        {{ topic?.description || "Brak opisu." }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  topic: { type: Object, required: true },
});
</script>
