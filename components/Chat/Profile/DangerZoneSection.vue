<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="warning"
      variant="tonal"
      title="Danger Zone"
      text="Here you can delete your account alogn with all the data connected with it"
    ></v-alert>
    <v-card-actions>
      <ChatProfileDeleteAccount
        @account-delete-requested="() => deleteAccount()"
      />
    </v-card-actions>
  </div>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~~/utilities/globalEnums";

const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();

const deleteAccount = async () => {
  console.warn("Deleting account");
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
    sechatStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  sechatStore.showSuccessSnackbar(SnackbarMessages.Success);
  return navigateTo("/user/register");
};
</script>

<style scoped></style>
