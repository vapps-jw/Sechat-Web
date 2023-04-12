<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        size="small"
        icon="mdi-account-group"
        color="warning"
        variant="outlined"
      ></v-btn>
    </template>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Add To Room</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-container>
          <div class="text-caption pa-3">Add Someone</div>
          <v-autocomplete
            :custom-filter="hasOccurrences"
            item-title="displayName"
            item-text="displayName"
            :items="getConnectionsAllowedForActiveRoom"
            item-value="id"
            v-model="chosenConnection"
            return-object
            no-data-text="You have no friends?"
          ></v-autocomplete>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="error" variant="outlined" @click="dialog = false">
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" variant="outlined" @click="invite">
          Invite
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const dialog = ref<boolean>(false);
const chosenConnection = ref<IConnectionRequest>();

const appStore = useSechatApp();
const userStore = useUserStore();
const config = useRuntimeConfig();

interface PropsModel {
  roomId: string;
}

const props = defineProps<PropsModel>();

const invite = async () => {
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
    appStore.showSuccessSnackbar(SnackbarMessages.Success);
  } catch (error) {
    appStore.showErrorSnackbar(error.statusMessage);
  } finally {
    chosenConnection.value = null;
    dialog.value = false;
  }
};

const getConnectionsAllowedForActiveRoom = computed(() => {
  if (!chatStore.activeRoomId) {
    return [];
  }
  return chatStore.availableConnections.filter(
    (uc) =>
      !uc.blocked &&
      uc.approved &&
      uc.displayName !== userStore.getUserName &&
      !chatStore.getActiveRoom.members.some(
        (arm) => arm.userName === uc.displayName
      )
  );
});

const hasOccurrences = (item: any, queryText: any) => {
  console.log("--> Lookup item", item);
  console.log("--> Lookup queryText", queryText);
  const queryParts = queryText.toLowerCase().split(" ");
  if (queryParts.length > 0) {
    return queryParts
      .map((x) => item.displayName.indexOf(x) > -1)
      .reduce((a, b) => a && b);
  }

  return true;
};
</script>

<style scoped></style>
