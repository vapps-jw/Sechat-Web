<template>
  <v-snackbar
    v-model="appStore.snackbarData.snackbar"
    :color="appStore.snackbarData.color"
    :timeout="appStore.snackbarData.timeout"
  >
    <v-icon :color="appStore.snackbarData.iconColor">{{
      appStore.snackbarData.icon
    }}</v-icon>
    {{ appStore.snackbarData.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
</script>

<style scoped></style>
