<template>
  <v-snackbar
    v-model="appStore.snackbarData.value.snackbar"
    :color="appStore.snackbarData.value.color"
    :timeout="appStore.snackbarData.value.timeout"
  >
    <v-icon :color="appStore.snackbarData.value.iconColor">{{
      appStore.snackbarData.value.icon
    }}</v-icon>
    {{ appStore.snackbarData.value.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
const appStore = useAppStore();
</script>

<style scoped></style>
