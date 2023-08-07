<template>
  <div>
    <v-window v-model="chatStore.activeChatTab">
      <!-- Chat -->
      <div v-if="chatStore.activeBottomNav === BottomNavBarSet.ChatNavBar">
        <v-window-item :value="ChatViews.Messages">
          <ChatTabsMessages />
        </v-window-item>
        <v-window-item :value="ChatViews.Rooms">
          <ChatTabsRooms />
        </v-window-item>
        <v-window-item :value="ChatViews.Contacts">
          <ChatTabsContacts />
        </v-window-item>
      </div>

      <!-- Organizer -->
      <div v-if="chatStore.activeBottomNav === BottomNavBarSet.CalendarNavBar">
        <v-window-item :value="ChatViews.Events">
          <ChatTabsEvents />
        </v-window-item>
        <v-window-item :value="ChatViews.Calendar">
          <ChatTabsCalendar />
        </v-window-item>
        <v-window-item :value="ChatViews.Notes">
          <ChatTabsNotes />
        </v-window-item>
      </div>

      <!-- Profile -->
      <div v-if="chatStore.activeBottomNav === BottomNavBarSet.ProfileNavBar">
        <v-window-item :value="ChatViews.Exit">
          <ChatTabsExit />
        </v-window-item>
        <v-window-item :value="ChatViews.Security">
          <ChatTabsSecurity />
        </v-window-item>
        <v-window-item :value="ChatViews.Settings">
          <ChatTabsSettings />
        </v-window-item>
      </div>

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
import { ChatViews, BottomNavBarSet } from "~~/utilities/globalEnums";
const chatStore = useSechatChatStore();
</script>

<style scoped></style>
