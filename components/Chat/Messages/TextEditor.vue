<template>
  <div class="ma-2">
    <chat-messages-tip-tap-editor
      v-model:model-value="chatStore.newMessage"
      @editorStateUpdate="editorUpdate"
    />
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
      v-if="!editorState.busy"
      variant="outlined"
      :icon="editorState.readyToShare ? 'mdi-share' : 'mdi-send'"
      color="warning"
      @click="pushMessage"
    ></v-btn>
  </div>
</template>

<script setup lang="ts">
import { scrollToBottom } from "~/utilities/documentFunctions";
import { SnackbarIcons, LocalStoreTypes } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const signalRstore = useSignalRStore();
const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();
const e2e = useE2Encryption();

const editorState = ref<IEditorState>({
  busy: false,
  editable: true,
  readyToShare: false,
});

const editorUpdate = (state: IEditorState) => {
  console.log("Editor state update", state);
  editorState.value = state;
};

const callRoomMessageApi = async () => {
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
    sechatStore.showErrorSnackbar(apiError.value.data);
  }
};

const callDirectMessageApi = async () => {
  const key = e2e.getKey(chatStore.activeContactId, LocalStoreTypes.E2EDM);
  if (!key) {
    sechatStore.showErrorSnackbar("Key not found");
    return;
  }
  const encryptedMessage = e2e.encryptMessage(chatStore.newMessage, key);
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/chat/send-direct-message`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        Text: encryptedMessage,
        Recipient: chatStore.getActiveContact.displayName,
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
  }
};

const pushMessage = async () => {
  if (!chatStore.newMessage) {
    return;
  }

  if (!signalRstore.isConnected) {
    sechatStore.showSnackbar({
      snackbar: true,
      text: "You are not connected",
      timeout: 2000,
      color: "warning",
      icon: SnackbarIcons.Warning,
      iconColor: "black",
    });
    return;
  }

  if (chatStore.activeRoomId && !chatStore.activeContactId) {
    callRoomMessageApi();
  }
  if (!chatStore.activeRoomId && chatStore.activeContactId) {
    callDirectMessageApi();
  }

  chatStore.clearNewMessage();
};
</script>

<style scoped></style>
