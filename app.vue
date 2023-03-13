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
const lockResolver = ref(null);

onMounted(async () => {
  console.warn("--> App onMounted");

  if (navigator && navigator.locks && navigator.locks.request) {
    const promise = new Promise((res) => {
      lockResolver.value = res;
    });

    navigator.locks.request("unique_lock_name", { mode: "shared" }, () => {
      return promise;
    });
  }
});
</script>
