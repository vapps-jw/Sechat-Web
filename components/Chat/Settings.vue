<template>
  <v-container>
    <v-card class="sechat-v-card-full">
      <v-toolbar>
        <v-avatar :color="stringToColor(userStore.getUserName)" class="mx-2">
          {{ getInitials(userStore.getUserName) }}</v-avatar
        >
        <v-toolbar-title>Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click="backToHomePage"
          icon="mdi-location-exit"
          variant="outlined"
        ></v-btn>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-list flex align-center>
          <v-list-subheader>User name</v-list-subheader>
          <v-list-item> {{ userStore.getUserName }} </v-list-item>
          <v-divider class="mt-5" />
          <v-container>
            <v-alert
              density="compact"
              type="info"
              variant="tonal"
              title="Email"
              text="Add email if you want to reset your password if you forget it"
            ></v-alert>
          </v-container>
          <ChatProfileEmailSection />
          <v-divider class="mt-5" />
          <v-container>
            <v-alert
              density="compact"
              type="info"
              variant="tonal"
              title="Notifications"
              text="Subscribe to receive push notifications on this device"
            ></v-alert>
          </v-container>
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
          <v-divider class="mt-5" />
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
import { getInitials, stringToColor } from "~/utilities/stringFunctions";
import { SnackbarMessages } from "~~/utilities/globalEnums";

const config = useRuntimeConfig();
const sechatApp = useSechatApp();
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
    sechatApp.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  sechatApp.showSuccessSnackbar(SnackbarMessages.Success);
  return navigateTo("/user/register");
};
</script>

<style scoped></style>
