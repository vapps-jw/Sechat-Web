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
        <v-card-text class="ma-0 pa-0 sechat-v-card-text-full">
          <v-list>
            <v-list-item
              class="my-1"
              v-for="uc in chatStore.getConnections.value"
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
                <v-icon v-else color="warning">mdi-message-question</v-icon>
              </template>

              <template v-slot:append>
                <v-btn
                  v-if="uc.blocked"
                  class="mx-2"
                  size="small"
                  icon="mdi-checkbox-marked-circle-outline"
                  color="success"
                  variant="outlined"
                ></v-btn>
                <v-btn
                  v-else
                  class="mx-2"
                  size="small"
                  icon="mdi-block-helper"
                  color="error"
                  variant="outlined"
                ></v-btn>
                <v-btn
                  v-if="
                    !uc.approved &&
                    uc.invitedName === userData.userProfile.value.userName
                  "
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
import { SnackbarIcons } from "~~/utilities/globalEnums";

const dialog = ref<boolean>(false);
const chatStore = useChatStore();
const userData = useUserData();
const config = useRuntimeConfig();
const appStore = useAppStore();

const isBusy = ref<boolean>(false);

const blockConnection = () => {};

const unblockConnection = () => {};

const approveConnection = () => {};

const deleteConnection = async (id: number) => {
  console.log("--> Deleting connection", id);
  const { error: deleteError } = await useFetch(
    `${config.public.apiBase}/user/connection-delete/?connectionId=${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (deleteError.value) {
    appStore.showSnackbar({
      snackbar: true,
      text: "Error on connection delete",
      timeout: 2000,
      color: "error",
      icon: SnackbarIcons.Error,
      iconColor: "black",
    });
    return;
  }

  appStore.showSnackbar({
    snackbar: true,
    text: "Connection deleted",
    timeout: 2000,
    color: "success",
    icon: SnackbarIcons.Success,
    iconColor: "black",
  });
};

const createInvitation = async (userName: string) => {
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
        username: userName,
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

<style scoped>
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}
</style>
