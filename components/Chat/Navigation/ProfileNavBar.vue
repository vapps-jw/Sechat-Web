<template>
  <v-bottom-navigation
    mode="shift"
    color="primary"
    v-model="chatStore.activeChatTab"
  >
    <v-btn
      v-if="userStore.isAdmin"
      color="error"
      :value="ChatViews.Admin"
      @click="chatStore.activateView(ChatViews.Admin)"
    >
      <Icon name="mdi:shield-crown-outline" />
      <span>Admin</span>
    </v-btn>
    <v-btn
      color="tertiary"
      :value="ChatViews.Security"
      @click="chatStore.activateView(ChatViews.Security)"
    >
      <Icon name="material-symbols:shield-lock-outline" />
      <span>Security</span>
    </v-btn>
    <v-btn
      color="tertiary"
      :value="ChatViews.Settings"
      @click="chatStore.activateView(ChatViews.Settings)"
    >
      <Icon name="material-symbols:settings-suggest" />
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
const userStore = useUserStore();
</script>

<style scoped></style>
