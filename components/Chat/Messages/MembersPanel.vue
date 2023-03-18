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
        <v-toolbar-title>Room Members</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 sechat-v-card-text-full">
        <v-autocomplete
          :custom-filter="hasOccurrences"
          item-title="displayName"
          item-text="displayName"
          :items="chatStore.getConnectionsAllowedForActiveRoom.value"
          item-value="id"
          variant="solo"
          v-model="chosenConnection"
          return-object
          no-data-text="You have no friends?"
        ></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" variant="text" @click="dialog = false">
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="invite"> Invite </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useChatStore();
const dialog = ref<boolean>(false);
const chosenConnection = ref<IConnectionRequest>();

const appStore = useAppStore();
const chatApi = useChatApi();

interface PropsModel {
  roomId: string;
}

const props = defineProps<PropsModel>();

const invite = async () => {
  try {
    await chatApi.inviteToRoom(chosenConnection.value, props.roomId);
    appStore.showSuccessSnackbar(SnackbarMessages.Success);
  } catch (error) {
    appStore.showErrorSnackbar(SnackbarMessages.Error);
  } finally {
    chosenConnection.value = null;
    dialog.value = false;
  }
};

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
