<template>
  <v-container class="d-flex justify-center align-center">
    <v-card class="sechat-v-card-full" min-width="350" width="700">
      <v-toolbar>
        <v-toolbar-title>Contacts</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-badge
          :model-value="
            chatStore.callLogs.filter(
              (cl) =>
                !cl.wasViewed &&
                cl.phonerName !== userStore.getUserName &&
                cl.calleeName === userStore.getUserName
            ).length > 0
          "
          :content="
            chatStore.callLogs.filter(
              (cl) =>
                !cl.wasViewed &&
                cl.phonerName !== userStore.getUserName &&
                cl.calleeName === userStore.getUserName
            ).length
          "
          color="error"
        >
          <ChatVideoLog
        /></v-badge>

        <ChatContactsAddContact @invite-user="createInvitation" />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-alert
          v-if="settingStore.settings.tooltipSetting === TooltpSetting.VISIBLE"
          class="alert-font"
          density="compact"
          type="info"
          variant="tonal"
          title="E2E Encryption"
          text="Both users have to be online to sync keys. If you are logged in on different devices you have to be online on both to sync keys between them. You can delete a key or create a new one at any time, previous messages will be deleted."
        ></v-alert>
        <ChatContactsList />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const settingStore = useSettingsStore();
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const chatStore = useSechatChatStore();
const userStore = useUserStore();

const createInvitation = async (userName: string) => {
  console.log("Calling contact request");
  const { error: apiError, data: res } = await useFetch(
    `${config.public.apiBase}/user/request-contact`,
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
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }

  sechatStore.showSuccessSnackbar("Invitation sent");
};
</script>
