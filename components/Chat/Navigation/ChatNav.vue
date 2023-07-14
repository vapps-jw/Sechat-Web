<template>
  <v-bottom-navigation
    mode="shift"
    color="primary"
    v-model="chatStore.activeChatTab"
  >
    <v-btn :value="ChatViews.Messages" @click="chatStore.activateMessagesView">
      <v-icon>mdi-chat-processing</v-icon>
      <span>Messages</span>
    </v-btn>
    <v-btn :value="ChatViews.Rooms" @click="chatStore.activateRoomsView">
      <v-icon>mdi-forum</v-icon>
      <span>Rooms</span>
    </v-btn>
    <v-btn :value="ChatViews.Contacts" @click="chatStore.activateContactsView">
      <v-icon>mdi-account-group</v-icon>
      <span>Contacts</span>
    </v-btn>

    <v-btn :value="ChatViews.Settings" @click="chatStore.activateSettingsView">
      <ChatStatusConnectionIcon />
      <span>Settings</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { ChatViews } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
</script>

<style scoped></style>
