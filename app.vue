<template>
  <div>
    <client-only>
      <VitePwaManifest />
    </client-only>
    <NuxtLoadingIndicator color="#fdd835" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
onMounted(async () => {
  console.warn("--> App onMounted");
});
</script>
