<template>
  <v-dialog v-model="dialog" persistent width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="error" class="mx-1">Delete</v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h6 text-center">
        Delete {{ props.room.name }}?
      </v-card-title>
      <v-card-actions>
        <v-btn color="success" variant="text" @click="dialog = false">
          No
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="deleteRoom(props.room.id)">
          Yes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { CustomCookies, SnackbarMessages } from "~~/utilities/globalEnums";

const dialog = ref<boolean>(false);

interface PropsModel {
  room: IRoom;
}

const props = defineProps<PropsModel>();

const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();
const e2e = useE2Encryption();

const deleteRoom = async (roomId: string) => {
  try {
    console.log("API Deleting room", roomId);
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/delete-room/?roomId=${roomId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (apiError.value) {
      console.error("API error", apiError.value);
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    dialog.value = false;
    sechatStore.showSuccessSnackbar(SnackbarMessages.Success);
  } catch (error) {
    sechatStore.showErrorSnackbar(error.statusMessage);
  }
};
</script>

<style scoped></style>
