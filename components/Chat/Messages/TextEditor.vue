<template>
  <v-row no-gutters class="mt-2 mb-2 ml-1">
    <v-col cols="10">
      <v-sheet>
        <chat-messages-tip-tap-editor v-model:model-value="newMessage" />
      </v-sheet>
    </v-col>
    <v-col cols="2" class="d-flex align-center justify-center">
      <v-sheet>
        <v-btn
          variant="outlined"
          icon="mdi-send"
          size="small"
          color="warning"
          @click="pushMessage"
        ></v-btn>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { SnackbarIcons } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const signalRstore = useSignalRStore();
const appStore = useSechatApp();
const config = useRuntimeConfig();
const sechatApp = useSechatApp();

const newMessage = ref<string>("");

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
