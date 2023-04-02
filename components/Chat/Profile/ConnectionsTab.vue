<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon="mdi-chevron-right-circle"></v-btn>
      </template>
      <v-card>
        <v-toolbar color="tertiary">
          <v-toolbar-title>Connections</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <ChatProfileAddConnection @invite-user="createInvitation" />
            <v-btn icon dark @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="ma-0 pa-0 overflow-auto">
          <v-list>
            <v-list-item
              class="my-1"
              v-for="uc in chatStore.getConnections"
              :key="`${uc.invitedName}-${uc.inviterName}`"
              :title="uc.displayName"
            >
              <template v-slot:prepend>
                <v-icon v-if="uc.blocked" color="error"
                  >mdi-alert-circle</v-icon
                >
                <v-icon v-else-if="uc.approved" color="success"
                  >mdi-check-bold</v-icon
                >
                <v-icon v-else color="warning">mdi-help-circle-outline</v-icon>
              </template>

              <template v-slot:append>
                <v-btn
                  v-if="
                    uc.blocked && uc.blockedByName === userStore.getUserName
                  "
                  @click="async () => allowConnection(uc.id)"
                  class="mx-2"
                  size="small"
                  icon="mdi-checkbox-marked-circle-outline"
                  color="success"
                  variant="outlined"
                ></v-btn>
                <v-btn
                  v-else
                  @click="async () => blockConnection(uc.id)"
                  class="mx-2"
                  size="small"
                  icon="mdi-block-helper"
                  color="error"
                  variant="outlined"
                ></v-btn>
                <v-btn
                  v-if="
                    !uc.approved && uc.invitedName === userStore.getUserName
                  "
                  @click="async () => approveConnection(uc.id)"
                  class="mx-2"
                  size="small"
                  icon="mdi-check-bold"
                  color="success"
                  variant="outlined"
                ></v-btn>
                <v-btn
                  @click="async () => deleteConnection(uc.id)"
                  class="mx-2"
                  size="small"
                  icon="mdi-delete"
                  color="error"
                  variant="outlined"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const dialog = ref<boolean>(false);
const chatStore = useSechatChatStore();
const config = useRuntimeConfig();
const sechatApp = useSechatApp();
const userStore = useUserStore();

const blockConnection = async (id: number) => {
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
    sechatApp.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }
  sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
};

const allowConnection = async (id: number) => {
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

const approveConnection = async (id: number) => {
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
    sechatApp.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
};

const deleteConnection = async (id: number) => {
  console.log("--> Deleting connection", id);
  const { error: deleteError } = await useFetch(
    `${config.public.apiBase}/user/delete-connection/?connectionId=${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (deleteError.value) {
    sechatApp.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
};

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
    sechatApp.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
};
</script>

<style scoped>
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}
</style>
