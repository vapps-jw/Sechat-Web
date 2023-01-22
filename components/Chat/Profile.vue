<template>
  <v-container>
    <v-card class="mx-auto sechat-v-card-full" max-width="800">
      <v-toolbar>
        <v-toolbar-title> Profile</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 sechat-v-card-text-full">
        <v-list>
          <v-list-subheader>My Connections</v-list-subheader>
          <v-list-item title="Friends">
            <template v-slot:append>
              <ChatProfileFriendsTab />
            </template>
          </v-list-item>
          <v-list-item title="Blocked Users">
            <template v-slot:append> </template>
          </v-list-item>
          <v-list-subheader color="error">Danger Zone</v-list-subheader>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { SnackbarIcons } from "~~/utilities/globalEnums";

const signalr = useSignalR();
const chatApi = useChatApi();
const chatStore = useChatStore();
const appStore = useAppStore();

const testSnackbar = () => {
  appStore.showSnackbar({
    snackbar: true,
    text: "TEST",
    timeout: 2000,
    color: "warning",
    icon: SnackbarIcons.Warning,
    iconColor: "black",
  });
};
</script>

<style scoped></style>
