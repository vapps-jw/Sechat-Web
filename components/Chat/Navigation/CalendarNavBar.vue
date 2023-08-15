<template>
  <v-bottom-navigation
    mode="shift"
    color="primary"
    v-model="chatStore.activeChatTab"
  >
    <v-btn
      color="tertiary"
      :value="ChatViews.Events"
      @click="chatStore.activateView(ChatViews.Events)"
    >
      <v-icon>mdi-calendar-star</v-icon>
      <span>Events</span>
    </v-btn>
    <!-- <v-btn
      color="tertiary"
      :value="ChatViews.Calendar"
      @click="chatStore.activateView(ChatViews.Calendar)"
    >
      <v-icon>mdi-calendar-month</v-icon>
      <span>Calendar</span>
    </v-btn> -->
    <!-- <v-btn
        color="tertiary"
        v-if="chatStore.activeBottomNav === BottomNavBarSet.CalendarNavBar"
        :value="ChatViews.Notes"
        @click="chatStore.activateView(ChatViews.Notes)"
      >
        <v-icon>mdi-notebook-edit-outline</v-icon>
        <span>Notes</span>
      </v-btn> -->
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
