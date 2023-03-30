<template>
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
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useChatStore();
const appStore = useAppStore();
const config = useRuntimeConfig();
const userStore = useUserStore();

const removeUserFromRoom = async (data: IMemeber) => {
  if (chatStore.getActiveRoom.value.members.length == 1) {
    appStore.showWarningSnackbar("Last member has to delete Room");
    return;
  }

  console.warn(
    "--> Room creator check",
    data.userName,
    userStore.getUserName,
    chatStore.getActiveRoom.value.creatorName
  );
  if (data.userName === chatStore.getActiveRoom.value.creatorName) {
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
</script>

<style scoped></style>
