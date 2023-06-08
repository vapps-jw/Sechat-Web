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
            :counter="25"
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
      (v && v.length <= 25) || "Room Name cant be longer than 25 characters",
  ],
});

const createRoom = async () => {
  const { valid } = await roomCreateForm.value?.validate();
  if (!valid) {
    console.warn("--> Form not valid");
    return;
  }

  signalR.createRoom({ roomName: roomData.value.name, userEncrypted: false });
  roomData.value.name = "";
  dialog.value = false;
};
</script>

<style scoped></style>
