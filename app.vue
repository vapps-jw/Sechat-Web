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

<script setup lang="ts"></script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.5s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
