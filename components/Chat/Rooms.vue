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
            v-for="room in chatStore.availableRooms"
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
              >
              </v-btn>
              <v-btn
                @click="selectRoomClicked(room.id)"
                size="small"
                icon
                color="success"
                variant="outlined"
                class="mr-2"
              >
                <v-icon
                  v-if="room.messages.filter((m) => !m.wasViewed).length === 0"
                  >mdi-arrow-right</v-icon
                >
                <v-badge
                  v-if="room.messages.filter((m) => !m.wasViewed).length > 0"
                  :content="room.messages.filter((m) => !m.wasViewed).length"
                  color="error"
                >
                  <v-icon>mdi-arrow-right</v-icon>
                </v-badge>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const config = useRuntimeConfig();
const sechatApp = useSechatApp();
const userStore = useUserStore();

const selectRoomClicked = (roomId: string) => {
  sechatApp.showLoadingOverlay();
  chatStore.selectRoom(roomId);
  sechatApp.hideLoadingOverlay();
};

const leaveRoom = async (room: IRoom) => {
  try {
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/leave-room`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          RoomId: room.id,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    chatStore.deleteRoom(room.id);
    sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
  } catch (error) {
    sechatApp.showErrorSnackbar(error.statusMessage);
  }
};
</script>

<style scoped></style>
