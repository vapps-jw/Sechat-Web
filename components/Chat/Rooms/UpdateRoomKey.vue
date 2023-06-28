<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="success">Update Key</v-btn>
    </template>

    <v-card>
      <v-toolbar>
        <v-toolbar-title>Update Room`s Secret Key</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form ref="invitationCreateForm" @submit.prevent>
          <v-text-field
            v-model="formData.roomKey"
            :rules="formData.nameRules"
            :counter="100"
            label="Secret Key"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn variant="tonal" @click="updateKey"> Update </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);

interface PropsModel {
  room: IRoom;
}

const props = defineProps<PropsModel>();

const e2e = useE2Encryption();
const appStore = useSechatAppStore();

const invitationCreateForm = ref<HTMLFormElement>();
const formData = ref({
  valid: true,
  roomKey: "",
  nameRules: [
    (v) => !!v || "Room Key is required",
    (v) =>
      (v && v.length <= 100) || "Room Key must have less than 100 characters",
  ],
});

const updateKey = async () => {
  if (!formData.value.roomKey) {
    return;
  }
  appStore.updateLoadingOverlay(true);
  e2e.addRoomKey({
    roomId: props.room.id,
    key: formData.value.roomKey,
  });

  // TODO: new endpoint to update all messages in this room
  appStore.updateLoadingOverlay(false);
};
</script>

<style scoped></style>
