<template>
  <v-bottom-navigation mode="shift" color="primary" v-model="selectedNav">
    <v-btn value="messages" @click="chatStore.activateMessagesView">
      <v-icon>mdi-chat-processing</v-icon>
      <span>Messages</span>
    </v-btn>
    <v-btn value="rooms" @click="chatStore.activateRoomsView">
      <v-icon>mdi-forum</v-icon>
      <span>Rooms</span>
    </v-btn>
    <v-btn value="contacts" @click="chatStore.activateContactsView">
      <v-icon>mdi-contacts</v-icon>
      <span>Contacts</span>
    </v-btn>

    <v-btn value="settings" @click="chatStore.activateSettingsView">
      <ChatStatusConnectionIcon />
      <span>Settings</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { ChatViews } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const selectedNav = ref(ChatViews.Rooms);
</script>

<style scoped></style>
