<template>
  <div>
    <client-only>
      <VitePwaManifest />
    </client-only>
    <NuxtLayout>
      <NuxtLoadingIndicator color="#fdd835" />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts"></script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
