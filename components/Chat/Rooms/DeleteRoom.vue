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
        <v-card-title class="text-h6 text-center">
          Wanna delete {{ props.room.name }}?
        </v-card-title>
        <v-card-actions>
          <v-btn color="success" variant="text" @click="dialog = false">
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="async () => await deleteRoom(props.room.id)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);

interface PropsModel {
  room: IRoom;
}

const emit = defineEmits(["roomDeleteRequested"]);
const props = defineProps<PropsModel>();

const deleteRoom = async (roomId: string) => {
  emit("roomDeleteRequested", roomId);
  dialog.value = false;
};
</script>

<style scoped></style>
