<template>
  <div data-cy="messages-test-editor-container" class="ma-2">
    <chat-messages-tip-tap-editor
      v-model:model-value="chatStore.newMessage"
      @editorStateUpdate="editorUpdate"
    />
  </div>
  <div class="d-flex justify-space-between mx-2 my-1">
    <div class="d-flex justify-start">
      <v-btn
        class="mr-4"
        variant="outlined"
        icon="mdi-close-circle"
        size="small"
        color="tertiary"
        @click="chatStore.clearNewMessage"
      ></v-btn>
      <v-btn
        class="mr-4"
        icon="mdi-arrow-down-drop-circle"
        size="small"
        variant="outlined"
        color="tertiary"
        @click="() => scrollToBottom('chatView')"
      ></v-btn>
      <v-btn
        v-if="!chatStore.messageContainsImage"
        class="mr-4"
        icon="mdi-paperclip"
        size="small"
        variant="outlined"
        color="tertiary"
        @click="attachAction"
      ></v-btn>
      <v-file-input
        class="hidden"
        :hide-details="true"
        ref="imageToUpload"
        @change="attachImage"
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        v-model="chosenFile"
      >
      </v-file-input>
    </div>
    <v-btn
      data-cy="push-message-btn"
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
import { HubConnectionState } from "@microsoft/signalr";

const chatStore = useSechatChatStore();
const signalRstore = useSignalRStore();
const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();
const e2e = useE2Encryption();
const imageApi = useImageApi();

const chosenFile = ref<File[]>(null);
const chosenFileLoaidng = ref<boolean>(false);
const imageToUpload = ref();

const attachAction = () => {
  console.log("Clicked", imageToUpload?.value);
  imageToUpload?.value.click();
};

const attachImage = async (e) => {
  if (e.target === undefined) {
    sechatStore.showErrorSnackbar("Bad Image selected");
  }
  chosenFileLoaidng.value = true;
  const files = e.target.files as File[];
  if (files.length === 0 || !files[0]) {
    chosenFileLoaidng.value = false;
    return;
  }
  console.log("Chosen File", files);
  const result = await imageApi.processChatImage(files[0]);
  if (result.success) {
    console.log("Image Processed", result.data);
    chatStore.newMessage = result.data;
  } else {
    sechatStore.showErrorSnackbar("Something went wrong");
  }
  chosenFileLoaidng.value = false;
  chosenFile.value = null;
};

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
  const key = e2e.getKey(chatStore.activeRoomId, LocalStoreTypes.E2EROOMS);
  if (!key) {
    sechatStore.showErrorSnackbar("Key not found");
    return;
  }
  const encryptedMessage = e2e.encryptMessage(chatStore.newMessage, key);
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/chat/send-message`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        Text: encryptedMessage,
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
    sechatStore.showErrorSnackbar("Message not sent");
  }
};

const pushMessage = async () => {
  if (!chatStore.newMessage) {
    return;
  }

  if (
    !signalRstore.connection ||
    signalRstore.connection.state !== HubConnectionState.Connected
  ) {
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

<style scoped>
.hidden {
  display: none;
}
</style>
