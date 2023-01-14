<template>
  <div>
    <v-card>
      <v-tabs
        v-model="chatStore.activeChatTab.value"
        centered
        stacked
        fixed-tabs
      >
        <v-tab value="messages">
          <v-icon>mdi-chat-processing</v-icon>
          Messages
        </v-tab>

        <v-tab value="rooms">
          <v-icon>mdi-forum</v-icon>
          Rooms
        </v-tab>

        <v-tab value="settings">
          <v-icon>mdi-cogs</v-icon>
          Settings
        </v-tab>
      </v-tabs>
      <v-window v-model="chatStore.activeChatTab.value">
        <v-window-item value="messages"> <ChatMessages /> </v-window-item>
        <v-window-item value="rooms"> <ChatRooms /> </v-window-item>
        <v-window-item value="settings"> <ChatSettings /> </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const signalr = useSignalR();
const chatApi = useChatApi();
const chatStore = useChatStore();

onMounted(async () => {
  console.log("--> Chat mounted");
  signalr.openConnection();
  await chatApi.getRooms();
});
</script>

<style scoped></style>
