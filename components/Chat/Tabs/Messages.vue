<template>
  <v-container
    v-if="!chatStore.getActiveRoom && !chatStore.getActiveContact"
    class="bg-transparent d-flex justify-center align-center flex-column sechat-v-card-full"
  >
    <NuxtImg
      src="/logos/logo-only-transparent-300x300.png"
      alt=""
      width="300"
      height="150"
    ></NuxtImg>
    <div class="text-h6">Select a Room or createa new one</div>
  </v-container>
  <v-container class="d-flex justify-center align-center" v-else>
    <!-- Room Messags -->

    <v-card
      min-width="350"
      width="700"
      class="sechat-v-card-full"
      v-if="chatStore.getActiveRoom && !chatStore.getActiveContact"
    >
      <v-toolbar>
        <div class="d-flex ml-2 justify-start flex-column">
          <v-toolbar-title>{{ chatStore.getActiveRoom.name }}</v-toolbar-title>
          <div class="d-flex justify-start flex-row">
            <v-chip
              v-if="chatStore.getActiveRoom.encryptedByUser"
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

        <chat-rooms-settings :room-id="chatStore.getActiveRoom.id" />
      </v-toolbar>
      <v-divider />
      <chat-messages-container :messages="chatStore.getActiveRoom.messages" />
      <v-spacer />
      <chat-messages-text-editor />
    </v-card>

    <!-- Direct Messages -->

    <v-card
      min-width="350"
      width="700"
      class="sechat-v-card-full"
      v-if="!chatStore.getActiveRoom && chatStore.getActiveContact"
    >
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
      </v-toolbar>
      <v-divider />
      <chat-messages-container
        :messages="chatStore.getActiveContact?.directMessages"
      />
      <v-spacer />
      <chat-messages-text-editor />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
</script>
