<template>
  <div class="d-flex">
    <v-chip
      v-for="u in chatStore.getActiveRoomMembers"
      :key="u.userName"
      class="ma-2"
      :color="
        u.userName !== chatStore.getActiveRoom.creatorName
          ? 'primary'
          : 'warning'
      "
      label
    >
      {{ u.userName }}
      <v-icon
        v-if="u.userName !== chatStore.getActiveRoom.creatorName"
        @click="async () => await removeUserFromRoom(u)"
        end
        icon="mdi-close-circle"
      ></v-icon>
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const sechatApp = useSechatApp();
const config = useRuntimeConfig();
const userStore = useUserStore();

const removeUserFromRoom = async (data: IMemeber) => {
  if (chatStore.getActiveRoom.members.length == 1) {
    sechatApp.showWarningSnackbar("Last member has to delete Room");
    return;
  }

  console.warn(
    "--> Room creator check",
    data.userName,
    userStore.getUserName,
    chatStore.getActiveRoom.creatorName
  );
  if (data.userName === chatStore.getActiveRoom.creatorName) {
    sechatApp.showWarningSnackbar("Cant remove room creator");
    return;
  }

  console.warn("--> Removing User from Room", data);

  try {
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
          RoomId: chatStore.getActiveRoom.id,
          ConnectionId: chatStore.getContacts.find(
            (c) =>
              c.invitedName === data.userName || c.inviterName === data.userName
          )?.id,
        },
      }
    );

    sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }
  } catch (error) {
    sechatApp.showErrorSnackbar(error.statusMessage);
  }
};
</script>

<style scoped></style>
