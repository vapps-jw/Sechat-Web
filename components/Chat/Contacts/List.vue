<template>
  <v-list>
    <v-list-item
      class="pa-2"
      v-for="uc in chatStore.getContacts"
      :key="`${uc.invitedName}-${uc.inviterName}`"
      :title="uc.displayName"
    >
      <template v-slot:prepend>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="plain"
              v-bind="props"
            ></v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn
                v-if="uc.blocked && uc.blockedByName === userStore.getUserName"
                @click="async () => allowContact(uc.id)"
                class="mx-1"
                size="small"
                icon="mdi-checkbox-marked-circle-outline"
                color="success"
                variant="outlined"
              ></v-btn>
              <v-btn
                v-else
                @click="async () => blockContact(uc.id)"
                class="mx-1"
                size="small"
                icon="mdi-block-helper"
                color="error"
                variant="outlined"
              ></v-btn>
            </v-list-item>
            <v-list-item
              v-if="!uc.approved && uc.invitedName === userStore.getUserName"
            >
              <v-btn
                @click="async () => approveContact(uc.id)"
                class="mx-1"
                size="small"
                icon="mdi-check-bold"
                color="success"
                variant="outlined"
              ></v-btn
            ></v-list-item>
            <v-list-item>
              <v-btn
                @click="async () => deleteContact(uc.id)"
                class="mx-1"
                size="small"
                icon="mdi-delete"
                color="error"
                variant="outlined"
              ></v-btn
            ></v-list-item>
          </v-list>
        </v-menu>
        <div class="d-flex flex-column mr-2">
          <div class="d-flex align-center justify-center">
            <chat-status-contact-state-icon :contact="uc" />
          </div>
          <div class="d-flex align-center justify-center">
            <v-icon v-if="uc.blocked" size="x-small" color="error"
              >mdi-alert-circle</v-icon
            >
            <v-icon v-else-if="uc.approved" size="x-small" color="success"
              >mdi-check-bold</v-icon
            >
            <v-icon v-else size="x-small" color="warning"
              >mdi-help-circle-outline</v-icon
            >
          </div>
        </div>
        <div class="d-flex align-center justify-center mr-2">
          <v-avatar :color="uc.color"> {{ uc.initials }} </v-avatar>
        </div>
      </template>
      <template v-slot:append>
        <v-btn
          v-if="uc.approved && !uc.blocked"
          @click="startVideoCall(uc)"
          size="small"
          icon="mdi-phone"
          color="success"
          variant="outlined"
        ></v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { SnackbarMessages, ContactState } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const config = useRuntimeConfig();
const sechatApp = useSechatApp();
const userStore = useUserStore();
const webRTCStore = useWebRTCStore();

const startVideoCall = (uc: IContactRequest) => {
  console.log("--> Starting new call with", uc.displayName);
  webRTCStore.updateVideoCallContact(uc);
  webRTCStore.updateVideoCallViewVisible(true);
};

const blockContact = async (id: number) => {
  console.log("--> Calling connection block");

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/block-connection/?connectionId=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatApp.showErrorSnackbar(apiError.value.data);
    return;
  }
  sechatApp.showSuccessSnackbar("Contact blocked");
};

const allowContact = async (id: number) => {
  console.log("--> Calling connection block");
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/allow-connection/?connectionId=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatApp.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }
  sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
};

const approveContact = async (id: number) => {
  console.log("--> Calling connection approve");
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/approve-connection/?connectionId=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatApp.showErrorSnackbar(apiError.value.data);
    return;
  }

  sechatApp.showSuccessSnackbar("Contact approved");
};

const deleteContact = async (id: number) => {
  console.log("--> Deleting connection", id);
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/delete-connection/?connectionId=${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatApp.showErrorSnackbar(apiError.value.data);
    return;
  }

  sechatApp.showSuccessSnackbar("Contact deleted");
};
</script>

<style scoped></style>
