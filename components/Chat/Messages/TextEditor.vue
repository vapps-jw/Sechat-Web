<template>
  <div class="ma-2">
    <chat-messages-tip-tap-editor v-model:model-value="chatStore.newMessage" />
  </div>
  <div class="d-flex justify-space-between mx-2 my-1">
    <div>
      <v-btn
        class="mr-5"
        variant="outlined"
        icon="mdi-close-circle"
        size="small"
        color="tertiary"
        @click="chatStore.clearNewMessage"
      ></v-btn>
      <v-btn
        icon="mdi-arrow-down-drop-circle"
        size="small"
        variant="outlined"
        color="tertiary"
        @click="() => scrollToBottom('chatView')"
      ></v-btn>
    </div>
    <v-btn
      variant="outlined"
      icon="mdi-send"
      size="small"
      color="warning"
      @click="pushMessage"
    ></v-btn>
  </div>
</template>

<script setup lang="ts">
import { scrollToBottom } from "~/utilities/documentFunctions";
import { SnackbarIcons } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const signalRstore = useSignalRStore();
const appStore = useSechatApp();
const config = useRuntimeConfig();
const sechatApp = useSechatApp();

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
          Text: chatStore.newMessage,
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
  if (!chatStore.newMessage) {
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
  chatStore.clearNewMessage();
};
</script>

<style scoped></style>
