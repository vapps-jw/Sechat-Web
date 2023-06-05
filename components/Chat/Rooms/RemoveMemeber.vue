<template>
  <v-container>
    <v-list density="compact">
      <div class="text-caption">Room members</div>
      <v-list-item
        v-for="u in chatStore.getActiveRoomMembers"
        :key="u.userName"
        class="mr-1"
        :color="
          u.userName !== chatStore.getActiveRoom.creatorName
            ? 'primary'
            : 'warning'
        "
      >
        <template v-slot:prepend>
          <v-avatar :color="stringToColor(u.userName)">
            {{ getInitials(u.userName) }}
          </v-avatar>
        </template>
        <v-list-item-title v-text="u.userName"></v-list-item-title>
        <template v-slot:append>
          <v-btn
            v-if="
              u.userName !== chatStore.getActiveRoom.creatorName &&
              isContact(u.userName)
            "
            color="error"
            icon="mdi-close-circle"
            variant="text"
            @click="async () => await removeUserFromRoom(u)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { SnackbarMessages, ContactState } from "~~/utilities/globalEnums";
import { getInitials, stringToColor } from "~/utilities/stringFunctions";

const chatStore = useSechatChatStore();
const sechatApp = useSechatApp();
const config = useRuntimeConfig();
const userStore = useUserStore();

const isContact = (userName: string) => {
  return chatStore.getContacts.find((c) => c.displayName === userName);
};

const removeUserFromRoom = async (data: IRoomMemeber) => {
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