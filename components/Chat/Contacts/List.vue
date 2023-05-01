<template>
  <v-expansion-panels class="mt-2" variant="accordion">
    <v-expansion-panel
      v-for="uc in chatStore.getContacts"
      :key="`${uc.invitedName}-${uc.inviterName}`"
    >
      <v-expansion-panel-title disable-icon-rotate>
        {{ uc.displayName }}
        <template v-slot:actions>
          <v-icon v-if="uc.blocked" color="error">mdi-alert-circle</v-icon>
          <v-icon v-else-if="uc.approved" color="success"
            >mdi-check-bold</v-icon
          >
          <v-icon v-else color="warning">mdi-help-circle-outline</v-icon>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row no-gutters>
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
          <v-btn
            v-if="!uc.approved && uc.invitedName === userStore.getUserName"
            @click="async () => approveContact(uc.id)"
            class="mx-1"
            size="small"
            icon="mdi-check-bold"
            color="success"
            variant="outlined"
          ></v-btn>
          <v-btn
            @click="async () => deleteContact(uc.id)"
            class="mx-1"
            size="small"
            icon="mdi-delete"
            color="error"
            variant="outlined"
          ></v-btn>
          <v-spacer />
          <v-btn
            v-if="uc.approved && !uc.blocked"
            @click="startVideoCall(uc)"
            size="small"
            icon="mdi-phone"
            color="success"
            variant="outlined"
          ></v-btn>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const config = useRuntimeConfig();
const sechatApp = useSechatApp();
const userStore = useUserStore();
const signalRStore = useSignalRStore();

const startVideoCall = (uc: IContactRequest) => {
  try {
    signalRStore.initializeVideoCall(uc);
  } catch (error) {
    console.error("-->", error);
    sechatApp.showErrorSnackbar("Something failed");
  }
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
