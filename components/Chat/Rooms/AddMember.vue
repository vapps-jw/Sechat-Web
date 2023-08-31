<template>
  <v-container>
    <div class="text-caption my-3">Add someone to the current room</div>
    <v-autocomplete
      item-title="displayName"
      item-text="displayName"
      :items="getConnectionsAllowedForActiveRoom"
      item-value="id"
      v-model="chosenConnection"
      return-object
      no-data-text="You have no friends?"
    >
      <template v-slot:append>
        <v-icon @click="invite" color="success">mdi-plus-circle-outline</v-icon>
      </template>
    </v-autocomplete>
  </v-container>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const dialog = ref<boolean>(false);
const chosenConnection = ref<IContactRequest>();

const sechatStore = useSechatAppStore();
const userStore = useUserStore();
const config = useRuntimeConfig();

interface PropsModel {
  roomId: string;
}

const props = defineProps<PropsModel>();

const invite = async () => {
  dialog.value = false;
  try {
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/add-to-room`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          userName: chosenConnection.value.displayName,
          RoomId: props.roomId,
          ConnectionId: chosenConnection.value.id,
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
    sechatStore.showSuccessSnackbar(SnackbarMessages.Success);
  } catch (error) {
    sechatStore.showErrorSnackbar(error.statusMessage);
  } finally {
    dialog.value = false;
    chosenConnection.value = null;
  }
};

const getConnectionsAllowedForActiveRoom = computed(() => {
  if (!chatStore.activeRoomId) {
    return [];
  }
  return chatStore.availableContacts.filter(
    (uc) =>
      !uc.blocked &&
      uc.approved &&
      uc.displayName !== userStore.getUserName &&
      !chatStore.getActiveRoom.members.some(
        (arm) => arm.userName === uc.displayName
      )
  );
});
</script>

<style scoped></style>
