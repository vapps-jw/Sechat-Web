<template>
  <div>
    <v-btn @click="sechatNotifications.subscribeToPush"
      >Allow Notifications</v-btn
    >
  </div>
</template>

<script setup lang="ts">
const sechatNotifications = useSechatNotifications();
</script>

<style scoped></style>
