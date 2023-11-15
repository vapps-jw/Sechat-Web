<template>
  <v-card min-width="350" width="700" class="sechat-v-card-full">
    <v-toolbar>
      <v-toolbar-title>{{ chatStore.getActiveRoom.name }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <chat-rooms-settings :room-id="chatStore.getActiveRoom.id" />
    </v-toolbar>
    <v-divider />
    <chat-messages-container :messages="chatStore.getActiveRoom.messages" />
    <v-spacer />
    <chat-messages-text-editor />
  </v-card>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
</script>

<style scoped>
.on-top {
  z-index: 2;
}
</style>
