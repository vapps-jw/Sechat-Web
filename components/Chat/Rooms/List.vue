<template>
  <v-list>
    <v-list-item
      v-for="room in chatStore.availableRooms"
      :key="room.id"
      :title="room.name"
    >
      <template v-slot:prepend>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="plain"
              v-bind="props"
            ></v-btn>
          </template>

          <v-list>
            <v-list-item>
              <chat-rooms-delete-room
                v-if="room.creatorName === userStore.getUserName"
                :room="room"
              />
              <v-btn
                v-if="room.creatorName !== userStore.getUserName"
                @click="leaveRoom(room)"
                size="small"
                icon="mdi-exit-to-app"
                color="warning"
                variant="outlined"
              >
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:append>
        <v-btn
          @click="selectRoomClicked(room.id)"
          size="small"
          icon
          color="success"
          variant="outlined"
          class="mr-2"
        >
          <v-icon v-if="room.messages.filter((m) => !m.wasViewed).length === 0"
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
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const config = useRuntimeConfig();
const sechatApp = useSechatApp();
const userStore = useUserStore();
const appStore = useSechatAppStore();

const selectRoomClicked = (roomId: string) => {
  appStore.updateLoadingOverlay(true);
  chatStore.selectRoom(roomId);
  appStore.updateLoadingOverlay(false);
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
