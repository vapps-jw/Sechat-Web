<template>
  <v-app id="main-view">
    <v-main>
      <NuxtLoadingIndicator color="#fdd835" />
      <v-container class="bg-transparent">
        <div class="d-flex justify-center">
          <NuxtImg src="/logos/sechat-black-tr-300x300.png" alt=""></NuxtImg>
        </div>
        <v-divider class="my-4"></v-divider>
      </v-container>
      <client-only>
        <chat-snackbar />
      </client-only>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts"></script>

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
