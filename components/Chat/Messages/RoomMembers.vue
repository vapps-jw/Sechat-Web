<template>
  <div class="d-flex">
    <v-chip
      variant="outlined"
      size="x-small"
      v-for="u in chatStore.getActiveRoomMembers"
      :key="u.userName"
      class="mr-1"
      :color="
        u.userName !== chatStore.getActiveRoom.creatorName
          ? 'primary'
          : 'warning'
      "
      label
    >
      <template v-slot:prepend>
        <chat-messages-user-status-bagde :room-member="u" />
      </template>
      {{ u.userName }}
      <v-icon
        v-if="
          u.userName !== chatStore.getActiveRoom.creatorName &&
          isContact(u.userName)
        "
        @click="async () => await removeUserFromRoom(u)"
        end
        icon="mdi-close-circle"
      ></v-icon>
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { SnackbarMessages, ContactState } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const sechatApp = useSechatApp();
const config = useRuntimeConfig();
const userStore = useUserStore();

const isContact = (userName: string) => {
  return chatStore.getContacts.find((c) => c.displayName === userName);
};

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
