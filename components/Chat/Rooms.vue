<template>
  <v-container>
    <v-card class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>Rooms</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-rooms-create-room />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-list>
          <v-list-item
            v-for="room in chatStore.availableRooms.value"
            :key="room.id"
            :title="room.name"
          >
            <template v-slot:append>
              <chat-rooms-delete-room
                v-if="room.creatorName === userStore.getUserName"
                :room="room"
                class="mr-2"
              />
              <v-btn
                v-if="room.creatorName !== userStore.getUserName"
                @click="leaveRoom(room)"
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
const chatApi = useChatApi();
const sechatApp = useSechatApp();
const userStore = useUserStore();

const leaveRoom = async (room: IRoom) => {
  try {
    await chatApi.leaveRoom(room);
    chatStore.removeRoom(room);
  } catch (error) {
    sechatApp.showErrorSnackbar(SnackbarMessages.Error);
  }

  sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
};
</script>

<style scoped></style>
