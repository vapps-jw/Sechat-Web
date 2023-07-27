<template>
  <v-btn
    color="success"
    variant="outlined"
    @click="sechatNotifications.subscribeToPush"
    >Subscribe</v-btn
  >
</template>

<script setup lang="ts">
const sechatNotifications = useSechatNotifications();
</script>

<style scoped></style>
