<template>
  <div v-if="chatApi.processing">
    <v-app-bar density="compact">
      <v-spacer></v-spacer>
      <v-tabs v-model="chatStore.activeChatTab.value" stacked centered>
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

    <v-window v-model="chatStore.activeChatTab.value">
      <v-window-item value="messages"> <ChatMessages /> </v-window-item>
      <v-window-item value="rooms"> <ChatRooms /> </v-window-item>
      <v-window-item value="profile"> <ChatProfile /> </v-window-item>
    </v-window>
  </div>
  <v-progress-circular
    v-else
    :size="50"
    color="amber"
    indeterminate
  ></v-progress-circular>
</template>

<script setup lang="ts">
import { scrollToBottom } from "@/utilities/documentFunctions";
definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const signalr = useSignalR();
const chatApi = useChatApi();
const chatStore = useChatStore();

onMounted(async () => {
  console.warn("--> Chat onMounted");
  await chatApi.getState();
  signalr.openConnection();
  window.addEventListener("online", () => chatStore.handleOnline());
  window.addEventListener("offline", () => chatStore.handleOffline());
});

onBeforeUnmount(() => {
  console.warn("--> Chat onBeforeUnmount");
  window.removeEventListener("online", () => chatStore.handleOnline());
  window.removeEventListener("offline", () => chatStore.handleOffline());
});

watch(chatStore.activeChatTab, () => {
  if (chatStore.activeChatTab.value === "messages" && chatStore.activeRoomId) {
    console.log("--> Scrolling");
    scrollToBottom("chatView");
  }
});
</script>

<style scoped></style>
