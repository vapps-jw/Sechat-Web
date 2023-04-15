<template>
  <v-dialog v-model="dialog">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-forum-plus-outline"
        variant="outlined"
      ></v-btn>
    </template>

    <v-card>
      <v-card-title>
        <p class="text-h4 text-center">Create Room</p>
      </v-card-title>
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
      <v-card-actions>
        <v-btn color="warning" @click="dialog = false"> Close </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="createRoom"> Create </v-btn>
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

  signalR.createRoom(roomData.value.name);
  roomData.value.name = "";
  dialog.value = false;
};
</script>

<style scoped></style>
