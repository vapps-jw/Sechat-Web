<template>
  <div>
    <v-window v-model="chatStore.activeChatTab">
      <!-- Chat -->
      <v-window-item :value="ChatViews.Messages">
        <ChatTabsMessages />
      </v-window-item>
      <v-window-item :value="ChatViews.Rooms">
        <ChatTabsRooms />
      </v-window-item>
      <v-window-item :value="ChatViews.Contacts">
        <ChatTabsContacts />
      </v-window-item>

      <!-- Organizer -->
      <v-window-item :value="ChatViews.Events">
        <ChatTabsEvents />
      </v-window-item>
      <v-window-item :value="ChatViews.Calendar">
        <ChatTabsCalendar />
      </v-window-item>
      <v-window-item :value="ChatViews.Notes">
        <ChatTabsNotes />
      </v-window-item>

      <!-- Profile -->
      <v-window-item :value="ChatViews.Security">
        <ChatTabsSecurity />
      </v-window-item>
      <v-window-item :value="ChatViews.Settings">
        <ChatTabsSettings />
      </v-window-item>

      <!-- Always Present -->
      <v-window-item :value="ChatViews.AppsSelection">
        <ChatTabsAppsSelection />
      </v-window-item>
      <v-window-item :value="ChatViews.WorkInProgress">
        <ChatTabsWorkInProgress />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ChatViews } from "~~/utilities/globalEnums";

const webRTC = useWebRTCStore();
const chatStore = useSechatChatStore();
</script>

<style scoped></style>
