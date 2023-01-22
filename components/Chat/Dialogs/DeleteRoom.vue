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
          class="mr-6"
        ></v-btn>
      </template>
      <v-card>
        <v-card-title class="text-h5">
          Delete Room: {{ props.room.name }}
        </v-card-title>
        <v-card-text
          >Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green-darken-1" variant="text" @click="dialog = false">
            Disagree
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="dialog = false">
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
const config = useRuntimeConfig();

interface PropsModel {
  room: IRoom;
}

const props = defineProps<PropsModel>();

const deleteRoom = async (roomId: string) => {
  console.log("--> Deleting room", roomId);
  const { error: deleteError } = await useFetch(
    `${config.public.apiBase}/chat/delete-room/?roomId=${roomId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (deleteError.value) {
    throw createError({
      ...deleteError.value,
      statusMessage: "Failed to delete",
      statusCode: deleteError.value.statusCode,
    });
  }
};
</script>

<style scoped></style>
