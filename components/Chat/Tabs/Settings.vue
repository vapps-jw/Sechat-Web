<template>
  <v-container class="d-flex justify-center align-center">
    <v-card min-width="350" width="700" class="sechat-v-card-full">
      <v-toolbar>
        <div class="ml-2">
          <ChatUserAvatar
            :active="false"
            :user-name="userStore.getUserName"
            size="default"
          />
        </div>
        <v-toolbar-title>{{ userStore.getUserName }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click="backToHomePage"
          icon="mdi-location-exit"
          variant="outlined"
        ></v-btn>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-list flex align-center>
          <v-list-item>
            <ChatProfileEmailSection />
          </v-list-item>
          <v-divider />
          <v-list-item>
            <ChatProfileNotificationsSection />
          </v-list-item>
          <v-divider />
          <v-list-item>
            <ChatProfileDangerZoneSection />
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
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
