<template>
  <v-btn
    color="error"
    variant="outlined"
    @click="sechatNotifications.unsubscribeFromPush"
    >Unsubscribe</v-btn
  >
</template>

<script setup lang="ts">
const sechatNotifications = useSechatNotifications();
</script>

<style scoped></style>
