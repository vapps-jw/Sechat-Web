<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon="mdi-delete"
          color="error"
          size="small"
          variant="outlined"
        ></v-btn>
      </template>
      <v-card>
        <v-card-title class="text-h6 text-center">
          Wanna delete {{ props.room.name }}?
        </v-card-title>
        <v-card-actions>
          <v-btn color="success" variant="text" @click="dialog = false">
            No
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="deleteRoom(props.room.id)"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const dialog = ref<boolean>(false);

interface PropsModel {
  room: IRoom;
}

const props = defineProps<PropsModel>();

const appStore = useSechatApp();
const config = useRuntimeConfig();

const deleteRoom = async (roomId: string) => {
  console.log("--> API Deleting room", roomId);
  const { error: deleteError } = await useFetch(
    `${config.public.apiBase}/chat/delete-room/?roomId=${roomId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  dialog.value = false;

  if (deleteError.value) {
    appStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }
  appStore.showSuccessSnackbar(SnackbarMessages.Success);
};
</script>

<style scoped></style>
