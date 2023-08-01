<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-forum-plus-outline"
        variant="outlined"
      ></v-btn>
    </template>

    <v-card>
      <v-toolbar>
        <v-toolbar-title>Create Room</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form ref="roomCreateForm" @submit.prevent>
          <v-alert
            class="alert-font"
            density="compact"
            type="info"
            variant="tonal"
            title="Encryption"
            text="Rooms are end-to-end encrypted, when you add someone to a room it`ll ask other members for a Key, only then he can send and receive messages"
          ></v-alert>
          <v-text-field
            class="my-2"
            v-model="roomData.name"
            :rules="roomData.nameRules"
            :counter="20"
            label="Room Name"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn variant="tonal" @click="createRoom"> Create </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
const signalR = useSignalR();

const roomCreateForm = ref<HTMLFormElement>();
const roomData = ref({
  valid: true,
  name: "",
  nameRules: [
    (v) => !!v || "Room Name is required",
    (v) =>
      (v && v.length <= 20) || "Room Name cant be longer than 20 characters",
  ],
});

const createRoom = async () => {
  const { valid } = await roomCreateForm.value?.validate();
  if (!valid) {
    console.warn("Form not valid");
    return;
  }

  try {
    signalR.createRoom(roomData.value.name);
  } catch (error) {
    console.error("Room creation error", error);
  }

  roomData.value.name = "";
  dialog.value = false;
};
</script>

<style scoped></style>
