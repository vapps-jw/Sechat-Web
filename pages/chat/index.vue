<template>
  <div>
    <v-window v-model="chatStore.activeChatTab">
      <v-window-item value="messages"> <ChatMessages /> </v-window-item>
      <v-window-item value="rooms"> <ChatRooms /> </v-window-item>
      <v-window-item value="contacts"> <ChatContacts /> </v-window-item>
      <v-window-item value="settings"> <ChatProfile /> </v-window-item>
    </v-window>
    <!-- <ChatStatusConnectionIcon /> -->
    <ChatBottomNav />
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

const selectedNav = ref(ChatViews.Rooms);

const { activeChatTab } = storeToRefs(chatStore);

watch(activeChatTab, (newVal, oldVal) => {
  console.log("--> Nav Update", newVal, oldVal);

  if (selectedNav.value !== newVal) {
    selectedNav.value = newVal;
  }

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
