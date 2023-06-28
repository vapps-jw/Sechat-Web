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
          <v-text-field
            v-model="roomData.name"
            :rules="roomData.nameRules"
            :counter="20"
            label="Room Name"
            required
          ></v-text-field>
          <v-alert
            class="mt-2 alert-font"
            density="compact"
            type="info"
            variant="tonal"
            title="Encryption"
            text="Secure your room with a password for end-to-end encryption, room members must know this password and unlock the room on their side"
          ></v-alert>
          <v-checkbox
            v-model="roomData.userEncrypted"
            label="Use end-to-end encryption"
          ></v-checkbox>
          <v-text-field
            v-if="roomData.userEncrypted"
            @click:append="roomKey = !roomKey"
            :append-icon="roomKey ? 'mdi-eye' : 'mdi-eye-off'"
            :type="roomKey ? 'text' : 'password'"
            v-model="roomData.roomKey"
            :rules="roomData.roomKeyRules"
            clearable
            :counter="100"
            label="Room Secret Key"
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
const roomKey = ref<boolean>(true);
const e2e = useE2Encryption();

const roomCreateForm = ref<HTMLFormElement>();
const roomData = ref({
  valid: true,
  name: "",
  userEncrypted: false,
  roomKey: "",
  nameRules: [
    (v) => !!v || "Room Name is required",
    (v) =>
      (v && v.length <= 20) || "Room Name cant be longer than 20 characters",
  ],
  roomKeyRules: [
    (v) =>
      (v && v.length <= 100) || "Room Key must have less than 100 characters",
  ],
});

const createRoom = async () => {
  const { valid } = await roomCreateForm.value?.validate();
  if (!valid) {
    console.warn("--> Form not valid");
    return;
  }

  try {
    signalR.createRoom(
      {
        roomName: roomData.value.name,
        userEncrypted: roomData.value.userEncrypted,
      },
      roomData.value.roomKey
    );
  } catch (error) {
    console.error("--> Room creation error", error);
  }

  roomData.value.name = "";
  roomData.value.roomKey = "";
  dialog.value = false;
};
</script>

<style scoped></style>
