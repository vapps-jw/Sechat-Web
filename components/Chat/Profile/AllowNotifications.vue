<template>
  <div>
    <v-btn @click="sechatNotifications.subscribeToPush">Subscribe</v-btn>
  </div>
</template>

<script setup lang="ts">
const sechatNotifications = useSechatNotifications();
</script>

<style scoped></style>
