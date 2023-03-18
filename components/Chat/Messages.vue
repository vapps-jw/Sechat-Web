<template>
  <v-container v-if="!chatStore.getActiveRoom.value">
    <v-card class="mx-auto sechat-v-card-full">
      <div class="px-4 py-2 text-center w-100">
        <strong>Select Room</strong>
      </div>
    </v-card>
  </v-container>
  <v-container v-else>
    <v-card class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>{{
          chatStore.getActiveRoom.value.name
        }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-messages-members-panel />
      </v-toolbar>
      <chat-messages-room-members />
      <v-divider />
      <v-sheet id="chatView" class="ma-0 pa-0 sechat-flex-grow-overflow">
        <div
          class="d-flex"
          :class="
            isActiveUser(message)
              ? 'flex-row-reverse ma-1 '
              : 'flex-row flex-start ma-1 '
          "
          v-for="message in chatStore.getActiveRoom.value.messages"
        >
          <chat-messages-message :message="message" />
        </div>
      </v-sheet>
      <v-spacer />
      <chat-messages-text-editor />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { scrollToBottom } from "@/utilities/documentFunctions";

const chatStore = useChatStore();
const userData = useUserData();

onUpdated(() => {
  console.log("--> onUpdated Scrolling");
  scrollToBottom("chatView");
});

const isActiveUser = (message: IMessage) => {
  return message.nameSentBy === userData.getUsername.value;
};
</script>
