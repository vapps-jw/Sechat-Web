<template>
  <v-container>
    <v-card class="mx-auto sechat-v-card-full" max-width="800">
      <v-toolbar>
        <v-toolbar-title>Rooms</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-rooms-create-room @room-create-requested="createRoom" />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 sechat-v-card-text-full">
        <v-list>
          <v-list-item
            v-for="room in chatStore.getRooms.value"
            :key="room.id"
            :title="room.name"
          >
            <template v-slot:prepend>
              <v-btn
                size="small"
                icon="mdi-account-plus"
                color="success"
                variant="outlined"
                class="mr-2"
              ></v-btn>
            </template>

            <template v-slot:append>
              <chat-rooms-delete-room
                v-if="room.creatorName === userData.userProfile.value.userName"
                @room-delete-requested="async () => await deleteRoom(room.id)"
                :room="room"
              />
              <v-btn
                size="small"
                icon="mdi-exit-to-app"
                color="warning"
                variant="outlined"
                class="mr-2"
              ></v-btn>
              <v-btn
                @click="chatStore.selectRoom(room)"
                size="small"
                icon="mdi-arrow-right"
                color="success"
                variant="outlined"
                class="mr-2"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useChatStore();
const appStore = useAppStore();
const userData = useUserData();
const signalR = useSignalR();
const config = useRuntimeConfig();

const createRoom = async (newRoomName: string) => {
  console.log("--> Creating Room", newRoomName);
  signalR.createRoom(newRoomName);
};

const deleteRoom = async (roomId: string) => {
  console.log("--> Deleting room", roomId);
  const { error: deleteError } = await useFetch(
    `${config.public.apiBase}/chat/delete-room/?roomId=${roomId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (deleteError.value) {
    appStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }
  appStore.showSuccessSnackbar(SnackbarMessages.Success);
};
</script>

<style scoped></style>
