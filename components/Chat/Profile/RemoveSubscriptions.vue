<template>
  <div>
    <v-btn @click="sechatNotifications.unsubscribeFromPush">Unsubscribe</v-btn>
  </div>
</template>

<script setup lang="ts">
const sechatNotifications = useSechatNotifications();
</script>

<style scoped></style>
