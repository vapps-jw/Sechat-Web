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
      v-on:keyup.enter="pushMessage"
    ></v-textarea>
    <v-btn icon="mdi-send" color="warning" @click="pushMessage"></v-btn>
  </v-card-actions>
</template>

<script setup lang="ts">
import { SnackbarIcons } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const signalRstore = useSignalRStore();
const appStore = useSechatApp();
const config = useRuntimeConfig();
const sechatApp = useSechatApp();

const newMessage = ref("");

const callMessageApi = async () => {
  try {
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/send-message`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          Text: newMessage.value,
          RoomId: chatStore.activeRoomId,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: "Something went wrong",
      });
    }
  } catch (error) {
    sechatApp.showErrorSnackbar(error.statusMessage);
  }
};

const pushMessage = async () => {
  if (!newMessage.value) {
    return;
  }

  if (!signalRstore.isConnected) {
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

  callMessageApi();
  newMessage.value = "";
};
</script>

<style scoped></style>
