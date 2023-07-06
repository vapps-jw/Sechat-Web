<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn
        class="ml-3"
        v-bind="props"
        icon="mdi-account-plus"
        variant="outlined"
      ></v-btn>
    </template>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Add Contact</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form ref="invitationCreateForm" @submit.prevent>
          <v-text-field
            v-model="invitaitonData.name"
            :rules="invitaitonData.nameRules"
            :counter="50"
            label="User Name"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn variant="tonal" @click="createInvitation">
          Send Invitation
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
const emit = defineEmits(["inviteUser"]);

const invitationCreateForm = ref<HTMLFormElement>();
const invitaitonData = ref({
  valid: true,
  name: "",
  nameRules: [
    (v) => !!v || "User Name is required",
    (v) =>
      (v && v.length <= 50) || "User Name cant be longer than 50 characters",
  ],
});

const createInvitation = async () => {
  console.log("--> Sending invitation", invitaitonData.value.name);
  const { valid } = await invitationCreateForm.value?.validate();
  if (!valid) {
    console.warn("--> Form not valid");
    return;
  }

  emit("inviteUser", invitaitonData.value.name);
  invitaitonData.value.name = "";
  invitaitonData.value.valid = true;
  dialog.value = false;
};
</script>

<style scoped></style>
