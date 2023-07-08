<template>
  <v-card min-width="350" width="700" class="sechat-v-card-full">
    <v-toolbar>
      <div class="d-flex ml-2 justify-start flex-column">
        <v-toolbar-title>{{
          chatStore.getActiveContact.displayName
        }}</v-toolbar-title>
        <div class="d-flex justify-start flex-row">
          <v-chip
            v-if="chatStore.getActiveContact.encryptedByUser"
            color="warning"
            size="x-small"
          >
            E2E
          </v-chip>
          <v-chip v-else color="warning" size="x-small">
            Simple Encryption
          </v-chip>
        </div>
      </div>
      <v-spacer></v-spacer>
      <chat-messages-direct-message-settings />
    </v-toolbar>
    <v-divider />
    <chat-messages-container
      :messages="chatStore.getActiveContact?.directMessages"
    />
    <v-spacer />
    <chat-messages-text-editor />
  </v-card>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
</script>

<style scoped></style>
