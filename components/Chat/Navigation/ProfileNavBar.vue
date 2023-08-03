<template>
  <v-bottom-navigation
    mode="shift"
    color="primary"
    v-model="chatStore.activeChatTab"
  >
    <v-btn
      color="tertiary"
      :value="ChatViews.Exit"
      @click="chatStore.activateView(ChatViews.Exit)"
    >
      <v-icon>mdi-exit-to-app</v-icon>
      <span>Exit</span>
    </v-btn>
    <v-btn
      color="tertiary"
      :value="ChatViews.Security"
      @click="chatStore.activateView(ChatViews.Security)"
    >
      <v-icon>mdi-shield-lock</v-icon>
      <span>Security</span>
    </v-btn>
    <v-btn
      color="tertiary"
      :value="ChatViews.Settings"
      @click="chatStore.activateView(ChatViews.Settings)"
    >
      <ChatStatusConnectionIcon />
      <span>Settings</span>
    </v-btn>

    <v-btn
      color="warning"
      :value="ChatViews.AppsSelection"
      @click="chatStore.activateView(ChatViews.AppsSelection)"
    >
      <v-icon>mdi-apps</v-icon>
      <span>Sechat</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { ChatViews } from "~~/utilities/globalEnums";
const chatStore = useSechatChatStore();
</script>

<style scoped></style>
