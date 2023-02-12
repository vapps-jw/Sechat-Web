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
      <div class="d-flex">
        <v-chip
          v-for="u in chatStore.getActiveRoomMembers.value"
          :key="u.userName"
          class="ma-2"
          :color="
            u.userName !== chatStore.getActiveRoom.value.creatorName
              ? 'primary'
              : 'warning'
          "
          label
        >
          {{ u.userName }}
          <v-icon
            v-if="u.userName !== chatStore.getActiveRoom.value.creatorName"
            @click="async () => await removeUserFromRoom(u)"
            end
            icon="mdi-close-circle"
          ></v-icon>
        </v-chip>
      </div>

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
          <v-card>
            <v-card-item
              :class="
                isActiveUser(message)
                  ? 'flex-end bg-blue-darken-4 rounded-xl rounded-be-0'
                  : 'flex-start bg-grey-darken-3 rounded-xl rounded-bs-0'
              "
            >
              <v-card-title
                :class="isActiveUser(message) ? 'text-right' : ''"
                >{{ message.nameSentBy }}</v-card-title
              >
              <v-card-subtitle
                :class="isActiveUser(message) ? 'text-right' : ''"
                >{{
                  new Date(message.created).toLocaleString(
                    appStore.localLanguage.value
                  )
                }}</v-card-subtitle
              >
              <v-card-text class="px-0 py-0">
                <p
                  class="text--primary text-h6"
                  :class="isActiveUser(message) ? 'text-right' : ''"
                >
                  {{ message.text }}
                </p>
              </v-card-text>
            </v-card-item>
          </v-card>
        </div>
      </v-sheet>
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
const userData = useUserData();
const newMessage = ref("");

onUpdated(() => {
  console.log("--> onUpdated Scrolling");
  scrollToBottom("chatView");
});

const pushMessage = () => {
  if (newMessage.value) {
    signalR.sendMessage(newMessage.value, chatStore.activeRoomId.value);
    newMessage.value = "";
  }
};

const isActiveUser = (message: IMessage) => {
  return message.nameSentBy === userData.getUsername.value;
};

const removeUserFromRoom = async (data: IMemeber) => {
  if (chatStore.getActiveRoom.value.members.length == 1) {
    appStore.showWarningSnackbar("Last member has to delete Room");
    return;
  }

  console.warn(
    "--> Room creator check",
    userData.getUsername.value,
    chatStore.getActiveRoom.value.creatorName
  );
  if (
    userData.getUsername.value === chatStore.getActiveRoom.value.creatorName
  ) {
    appStore.showWarningSnackbar("Cant remove room creator");
    return;
  }

  console.warn("--> Removing User from Room", data);
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/chat/remove-from-room`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        userName: data.userName,
        RoomId: chatStore.getActiveRoom.value.id,
        ConnectionId: chatStore.getConnections.value.find(
          (c) =>
            c.invitedName === data.userName || c.inviterName === data.userName
        )?.id,
      },
    }
  );

  if (apiError.value) {
    appStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  appStore.showSuccessSnackbar(SnackbarMessages.Success);
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
