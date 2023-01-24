<template>
  <v-container
    v-if="!chatStore.getActiveRoom.value"
    class="d-flex justify-center"
  >
    <p>Select a Room</p>
  </v-container>
  <v-container v-else>
    <v-card class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title
          >Room: {{ chatStore.getActiveRoom.value.name }}</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-btn icon="mdi-account-plus"></v-btn>
      </v-toolbar>
      <v-card-text id="chatView" class="ma-0 pa-0 sechat-v-card-text-full">
        <v-list>
          <v-list-item
            class="mb-5"
            v-for="message in messages"
            :title="message.text"
            :subtitle="`${message.nameSentBy} on ${new Date(
              message.created
            ).toLocaleString(appStore.localLanguage.value)}`"
            :key="message.id"
          >
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-text-field v-model="msg" label="Message"></v-text-field>
        <v-btn icon="mdi-cached" color="info" @click="pushMessage"></v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { scrollToBottom } from "@/utilities/documentFunctions";
const chatStore = useChatStore();
const signalR = useSignalR();
const appStore = useAppStore();

const msg = ref("");

const pushMessage = () => {
  signalR.sendMessage(msg.value, chatStore.activeRoomId.value);
  msg.value = "";
};

const messages = computed(() => {
  console.log("--> Active room ID", [chatStore.activeRoomId.value]);
  if (!chatStore.activeRoomId.value) {
    console.log("--> Computed messages triggered", []);
    return [];
  }
  console.log("--> Computed messages triggered - with values");
  return chatStore.getActiveRoom.value.messages;
});

watch(messages, () => {
  console.log("--> Scrolling");
  scrollToBottom("chatView");
});
</script>
