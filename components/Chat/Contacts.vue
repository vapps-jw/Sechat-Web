<template>
  <v-container>
    <v-card class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>Contacts</v-toolbar-title>
        <v-spacer></v-spacer>
        <ChatContactsAddContact @invite-user="createInvitation" />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <ChatContactsList />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const config = useRuntimeConfig();
const sechatApp = useSechatApp();

const createInvitation = async (userName: string) => {
  console.log("--> Calling connection request");
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/request-connection`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        username: userName,
      },
    }
  );

  if (apiError.value) {
    sechatApp.showErrorSnackbar(apiError.value.data);
    return;
  }

  sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
};
</script>
