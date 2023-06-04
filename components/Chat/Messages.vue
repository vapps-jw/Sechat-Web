<template>
  <v-container v-if="!chatStore.getActiveRoom">
    <v-card class="mx-auto sechat-v-card-full">
      <div class="px-4 py-2 text-center w-100">
        <strong>Select Room</strong>
      </div>
    </v-card>
  </v-container>
  <v-container v-else>
    <v-card class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>{{ chatStore.getActiveRoom.name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-messages-members-panel :room-id="chatStore.getActiveRoom.id" />
      </v-toolbar>
      <chat-messages-room-members />
      <v-divider />
      <chat-messages-container />
      <chat-messages-text-editor />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
</script>
