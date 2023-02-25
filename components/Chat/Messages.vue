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
        <chat-messages-members-panel @invite-user-to-room="inviteToRoom" />
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
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useChatStore();
const appStore = useAppStore();
const config = useRuntimeConfig();
const userData = useUserData();

onUpdated(() => {
  console.log("--> onUpdated Scrolling");
  scrollToBottom("chatView");
});

const isActiveUser = (message: IMessage) => {
  return message.nameSentBy === userData.getUsername.value;
};

const inviteToRoom = async (data: IConnectionRequest) => {
  console.warn("--> API Inviting User", data);
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/chat/add-to-room`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        userName: data.displayName,
        RoomId: chatStore.activeRoomId,
        ConnectionId: data.id,
      },
    }
  );

  if (apiError.value) {
    appStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  appStore.showSuccessSnackbar(SnackbarMessages.Success);
};
</script>
