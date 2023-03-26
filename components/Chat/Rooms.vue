<template>
  <v-container class="pa-1 ma-0">
    <v-card class="mx-auto sechat-v-card-full" max-width="800">
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
                v-if="room.creatorName === userData.userProfile.value.userName"
                :room="room"
                class="mr-2"
              />
              <v-btn
                v-if="room.creatorName !== userData.userProfile.value.userName"
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
const userData = useUserData();
const chatApi = useChatApi();
const appStore = useAppStore();

const leaveRoom = async (room: IRoom) => {
  try {
    await chatApi.leaveRoom(room);
    chatStore.removeRoom(room);
  } catch (error) {
    appStore.showErrorSnackbar(SnackbarMessages.Error);
  }

  appStore.showSuccessSnackbar(SnackbarMessages.Success);
};
</script>

<style scoped></style>
