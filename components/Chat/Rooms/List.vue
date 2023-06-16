<template>
  <v-list>
    <v-list-item
      @click="selectRoomClicked(room.id)"
      :border="true"
      class="my-2 mx-1 pa-1"
      :class="
        chatStore.activeRoomId && chatStore.activeRoomId === room.id
          ? 'active-room'
          : ''
      "
      v-for="room in chatStore.availableRooms"
      :key="room.id"
      :title="room.name"
    >
      <template v-slot:prepend>
        <v-menu class="ma-0">
          <template v-slot:activator="{ props }">
            <v-btn
              class="ma-0"
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
                color="warning"
                >Leave
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:append>
        <v-badge
          class="mr-5"
          v-if="room.messages.filter((m) => !m.wasViewed).length > 0"
          :content="room.messages.filter((m) => !m.wasViewed).length"
          color="error"
        >
          <v-icon size="x-large">mdi-email</v-icon>
        </v-badge>
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

<style scoped>
.active-room {
  background: linear-gradient(0.6turn, transparent, transparent, #ffc107);
}
.active-room-icon {
  width: 10px;
}
</style>
