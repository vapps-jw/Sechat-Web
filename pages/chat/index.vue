<template>
  <div>
    <v-app-bar density="compact">
      <v-spacer></v-spacer>
      <v-tabs v-model="chatStore.activeChatTab" stacked centered>
        <v-tab value="messages">
          <v-icon>mdi-chat-processing</v-icon>
          Messages
        </v-tab>
        <v-tab value="rooms">
          <v-icon>mdi-forum</v-icon>
          Rooms
        </v-tab>
        <v-tab value="profile">
          <v-icon>mdi-account-details</v-icon>
          Profile
        </v-tab>
      </v-tabs>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-window v-model="chatStore.activeChatTab">
      <v-window-item value="messages"> <ChatMessages /> </v-window-item>
      <v-window-item value="rooms"> <ChatRooms /> </v-window-item>
      <v-window-item value="profile"> <ChatProfile /> </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { scrollToBottom } from "~~/utilities/documentFunctions";
import { ChatViews } from "~~/utilities/globalEnums";

definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const chatStore = useSechatChatStore();
const chatApi = useChatApi();
const chatApp = useSechatApp();

const { activeChatTab } = storeToRefs(chatStore);

watch(activeChatTab, (newVal, oldVal) => {
  console.log("--> Chat Tab Changed", activeChatTab.value);

  if (newVal === ChatViews.Messages) {
    scrollToBottom("chatView");
  }

  if (!chatStore.activeRoomId) {
    return;
  }
  if (activeChatTab.value !== ChatViews.Messages) {
    return;
  }
  try {
    chatApp.showLoadingOverlay();
    chatApi.markMessagesAsViewed(chatStore.activeRoomId);
    chatStore.markMessagesAsViewed();
  } catch (error) {
  } finally {
    chatApp.hideLoadingOverlay();
  }
});
</script>

<style scoped></style>
