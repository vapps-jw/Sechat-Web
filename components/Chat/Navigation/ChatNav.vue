<template>
  <ChatNavigationChatNavBar
    v-if="chatStore.activeBottomNav === BottomNavBarSet.ChatNavBar"
  />
  <ChatNavigationCalendarNavBar
    v-else-if="chatStore.activeBottomNav === BottomNavBarSet.CalendarNavBar"
  />
  <ChatNavigationProfileNavBar
    v-else-if="chatStore.activeBottomNav === BottomNavBarSet.ProfileNavBar"
  />
</template>

<script setup lang="ts">
import { BottomNavBarSet } from "~~/utilities/globalEnums";
const chatStore = useSechatChatStore();
</script>

<style scoped></style>
