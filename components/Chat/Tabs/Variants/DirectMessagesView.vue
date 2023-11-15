<template>
  <v-card min-width="350" width="700" class="sechat-v-card-full">
    <v-toolbar>
      <v-toolbar-title>{{
        chatStore.getActiveContact.displayName
      }}</v-toolbar-title>

      <v-spacer></v-spacer>
      <chat-messages-direct-message-settings />
    </v-toolbar>
    <v-divider />
    <chat-messages-container
      :messages="chatStore.getActiveContact?.directMessages"
    />
    <chat-messages-typing-users
      class="on-top"
      v-if="chatStore.typingUsers.length > 0"
    />
    <v-spacer />
    <chat-messages-text-editor />
  </v-card>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
</script>

<style scoped>
.on-top {
  z-index: 100;
}
</style>
