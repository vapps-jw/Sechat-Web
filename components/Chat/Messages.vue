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
          @invite-user-to-room="inviteToRoom"
        />
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
        <!-- <v-card
          class="d-flex justify-start mb-6"
          color="green lighten-4"
          flat
          tile
        >
          <v-card v-for="n in 3" :key="n" class="pa-2" outlined tile>
            justify-start
          </v-card>
        </v-card>
        <v-card
          class="d-flex justify-end mb-6"
          color="grey lighten-4"
          flat
          tile
        >
          <v-card v-for="n in 3" :key="n" class="pa-2" outlined tile>
            justify-end
          </v-card>
        </v-card> -->

        <v-card
          v-for="message in chatStore.getActiveRoom.value.messages"
          flat
          tile
          :class="
            message.nameSentBy === userData.getUsername.value
              ? 'd-flex justify-end mb-6 bg-primary rounded-xl rounded-be-0'
              : 'd-flex justify-start mb-6 bg-grey-darken-3 rounded-xl rounded-be-0'
          "
        >
          <div>
            <v-card-item>
              <v-card-title>{{ message.nameSentBy }}</v-card-title>
              <v-card-subtitle>{{
                new Date(message.created).toLocaleString(
                  appStore.localLanguage.value
                )
              }}</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <p class="text--primary">
                {{ message.text }}
              </p>
            </v-card-text>
          </div>
        </v-card>
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
  signalR.sendMessage(newMessage.value, chatStore.activeRoomId.value);
  newMessage.value = "";
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
