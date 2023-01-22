<template>
  <v-dialog v-model="dialog">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-account-plus"></v-btn>
    </template>

    <v-card>
      <v-card-title>
        <p class="text-h4 text-center">Send Invitation</p>
      </v-card-title>
      <v-card-text>
        <v-form ref="invitationCreateForm" @submit.prevent>
          <v-text-field
            v-model="invitaitonData.name"
            :rules="invitaitonData.nameRules"
            :counter="50"
            label="Username"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="warning" @click="dialog = false"> Close </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="createInvitation"> Send </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { SnackbarIcons } from "~~/utilities/globalEnums";
const dialog = ref<boolean>(false);
const config = useRuntimeConfig();
const appStore = useAppStore();

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
  const { valid } = await invitationCreateForm.value?.validate();
  if (!valid) {
    console.warn("--> Form not valid");
    return;
  }
  console.log("--> Calling connection request");

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/connection-request`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        username: invitaitonData.value.name,
      },
    }
  );

  if (apiError.value) {
    appStore.showSnackbar({
      snackbar: true,
      text: "Error sending Invitation",
      timeout: 2000,
      color: "error",
      icon: SnackbarIcons.Error,
      iconColor: "black",
    });
    dialog.value = false;
    return;
  }

  appStore.showSnackbar({
    snackbar: true,
    text: "Invitation Sent",
    timeout: 2000,
    color: "success",
    icon: SnackbarIcons.Success,
    iconColor: "black",
  });
  dialog.value = false;
};
</script>

<style scoped></style>
