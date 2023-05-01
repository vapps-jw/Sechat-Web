<template>
  <v-app id="minimal-view">
    <v-main>
      <GdprDialog />
      <chat-snackbar />
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
</script>
