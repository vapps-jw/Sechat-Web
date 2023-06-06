<template>
  <ChatVideoCall v-if="webRTC.videoCallViewVisible" />
  <div v-else>
    <v-window v-model="chatStore.activeChatTab">
      <v-window-item value="messages"> <ChatMessages /> </v-window-item>
      <v-window-item value="rooms"> <ChatRooms /> </v-window-item>
      <v-window-item value="contacts"> <ChatContacts /> </v-window-item>
      <v-window-item value="settings"> <ChatSettings /> </v-window-item>
    </v-window>
    <ChatBottomNav v-if="!webRTC.videoCallViewVisible" />
  </div>
</template>

<script setup lang="ts">
import { scrollToBottom } from "~/utilities/documentFunctions";
import { ChatViews } from "~~/utilities/globalEnums";

definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const webRTC = useWebRTCStore();
const chatStore = useSechatChatStore();
const chatApi = useChatApi();
const appStore = useSechatAppStore();

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
    const markMessagesAsVided =
      chatStore.getActiveRoom.messages.filter((m) => !m.wasViewed).length > 0;

    if (markMessagesAsVided) {
      console.log("--> Nav Update -> Marking messages as viewed");
      chatApi.markMessagesAsViewed(chatStore.activeRoomId);
      chatStore.markMessagesAsViewed();
    }
  } catch (error) {}
});
</script>

<style scoped></style>
