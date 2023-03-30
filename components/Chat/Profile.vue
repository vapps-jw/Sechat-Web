<template>
  <v-container>
    <v-card class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>{{ userStore.getUserName }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click="backToHomePage"
          size="small"
          icon="mdi-location-exit"
          color="warning"
          variant="outlined"
        ></v-btn>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-list flex align-center>
          <v-list-item title="My Connections">
            <template v-slot:append>
              <ChatProfileConnectionsTab />
            </template>
          </v-list-item>
          <v-divider class="mt-10" />
          <v-list-subheader>Notifications</v-list-subheader>
          <v-list-item>
            <template v-slot:prepend>
              <ChatProfileAllowNotifications />
            </template>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <ChatProfileRemoveSubscriptions />
            </template>
          </v-list-item>
          <v-divider class="mt-10" />
          <v-list-subheader color="error">Danger Zone</v-list-subheader>
          <v-list-item>
            <template v-slot:prepend>
              <ChatProfileDeleteAccount
                @account-delete-requested="() => deleteAccount()"
              />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const config = useRuntimeConfig();
const appStore = useAppStore();
const userStore = useUserStore();

const backToHomePage = () => {
  navigateTo("/");
};

const deleteAccount = async () => {
  console.warn("--> Deleting account");
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/account/delete-account`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    }
  );

  if (apiError.value) {
    appStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  appStore.showSuccessSnackbar(SnackbarMessages.Success);
  return navigateTo("/user/register");
};
</script>

<style scoped></style>
