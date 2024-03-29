<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        data-cy="room-options-btn"
        class="ma-0"
        icon="mdi-dots-vertical"
        variant="plain"
        v-bind="props"
      ></v-btn>
    </template>
    <v-list>
      <v-list-item v-if="props.room.creatorName === userStore.getUserName">
        <chat-rooms-delete-room
          data-cy="room-options-delete-btn"
          :room="room"
        />
      </v-list-item>
      <v-list-item v-if="props.room.creatorName !== userStore.getUserName">
        <v-btn class="mx-1" @click="leaveRoom(room)" color="warning"
          >Leave
        </v-btn>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { LocalStoreTypes, SnackbarMessages } from "~~/utilities/globalEnums";

interface PropsModel {
  room: IRoom;
}

const props = defineProps<PropsModel>();

const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const userStore = useUserStore();
const chatStore = useSechatChatStore();
const e2e = useE2Encryption();

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
    e2e.removeKey(room.id, LocalStoreTypes.E2EROOMS);

    sechatStore.showSuccessSnackbar(SnackbarMessages.Success);
  } catch (error) {
    sechatStore.showErrorSnackbar(error.statusMessage);
  }
};
</script>

<style scoped></style>
