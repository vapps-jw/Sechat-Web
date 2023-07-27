<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Notifications"
      text="Subscribe to receive push notifications on this device"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <ChatProfileAllowNotifications />
        <v-spacer />
        <ChatProfileRemoveSubscriptions />
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
