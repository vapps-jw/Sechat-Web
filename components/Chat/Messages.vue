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
        <v-toolbar-title>{{
          chatStore.getActiveRoom.value.name
        }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-messages-members-panel
          :room-name="chatStore.getActiveRoom.value.name"
          :room-id="chatStore.getActiveRoom.value.id"
          @user-to-invite-selected="inviteToRoom"
        />
      </v-toolbar>
      <p v-for="u in chatStore.getActiveRoomMembers.value" :key="u.userName">
        {{ u.userName }}
      </p>
      <v-card-text id="chatView" class="ma-0 pa-0 sechat-v-card-text-full">
        <v-list v-if="chatStore.activeRoomId.value">
          <v-list-item
            class="mb-5"
            v-for="message in chatStore.getActiveRoom.value.messages"
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
        <v-textarea
          clear-icon="mdi-close-circle"
          clearable
          counter
          no-resize
          rows="3"
          v-model="newMessage"
        ></v-textarea>
        <v-btn icon="mdi-send" color="warning" @click="pushMessage"></v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { scrollToBottom } from "@/utilities/documentFunctions";
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useChatStore();
const signalR = useSignalR();
const appStore = useAppStore();
const config = useRuntimeConfig();

const newMessage = ref("");

const pushMessage = () => {
  signalR.sendMessage(newMessage.value, chatStore.activeRoomId.value);
  newMessage.value = "";
};

const inviteToRoom = async (data) => {
  console.warn("--> Inviting User", data);
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/chat/add-to-room`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        userName: data.user,
        roomId: data.room,
      },
    }
  );

  if (apiError.value) {
    appStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  appStore.showSuccessSnackbar(SnackbarMessages.Success);
};

watch(chatStore.getActiveRoomMessages, () => {
  console.log("--> Scrolling");
  scrollToBottom("chatView");
});
</script>
