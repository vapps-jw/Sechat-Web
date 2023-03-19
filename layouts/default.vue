<template>
  <v-app id="main-view">
    <v-main>
      <v-container class="bg-transparent">
        <div class="d-flex justify-center">
          <NuxtImg src="/logos/sechat-black-tr-300x300.png" alt=""></NuxtImg>
        </div>
        <div class="d-flex justify-center">
          <v-chip class="ma-2" color="warning"> B E T A </v-chip>
        </div>
        <v-divider class="my-4"></v-divider>
      </v-container>
      <GdprDialog />
      <chat-snackbar />
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}
</script>

<style scoped>
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
