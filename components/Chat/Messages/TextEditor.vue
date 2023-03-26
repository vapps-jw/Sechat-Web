<template>
  <v-card-actions>
    <v-textarea
      variant="solo"
      clear-icon="mdi-close-circle"
      clearable
      counter
      no-resize
      rows="3"
      v-model="newMessage"
    ></v-textarea>
    <v-btn icon="mdi-send" color="warning" @click="pushMessage"></v-btn>
  </v-card-actions>
</template>

<script setup lang="ts">
import { SnackbarIcons } from "~~/utilities/globalEnums";

const chatStore = useChatStore();
const signalR = useSignalR();
const appStore = useAppStore();
const chatApi = useChatApi();

const newMessage = ref("");

const pushMessage = () => {
  if (newMessage.value) {
    if (!signalR.isConnected) {
      appStore.showSnackbar({
        snackbar: true,
        text: "You are not connected",
        timeout: 2000,
        color: "warning",
        icon: SnackbarIcons.Warning,
        iconColor: "black",
      });
      return;
    }
    chatApi.sendMessage(newMessage.value, chatStore.activeRoomId.value);
    newMessage.value = "";
  }
};
</script>

<style scoped></style>
