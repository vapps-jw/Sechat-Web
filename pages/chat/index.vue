<template>
  <div>
    <ChatSnackbar />
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
const appStore = useAppStore();

onMounted(async () => {
  console.log("--> Chat mounted");
  await chatApi.getState();
  signalr.openConnection();
});

watch(chatStore.activeChatTab, () => {
  if (chatStore.activeChatTab.value === "messages" && chatStore.activeRoomId) {
    console.log("--> Scrolling");
    scrollToBottom("chatView");
  }
});
</script>

<style scoped></style>
