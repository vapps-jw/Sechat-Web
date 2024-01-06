<template>
  <v-btn
    :loading="isBusy"
    :disabled="isBusy"
    color="error"
    variant="flat"
    @click="unsubscribeFromPush"
    >Unsubscribe</v-btn
  >
</template>

<script setup lang="ts">
import { SnackbarIcons } from "~/utilities/globalEnums";

const isBusy = ref<boolean>(false);
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const userStore = useUserStore();

const unsubscribeFromPush = async () => {
  if (isBusy.value) {
    return;
  } else {
    isBusy.value = true;
  }

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/notifications/push-unubscribe`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    }
  );

  if (apiError.value) {
    console.error(apiError.value);
    sechatStore.showSnackbar({
      snackbar: true,
      text: "Failed to unsubscribe",
      timeout: 2000,
      color: "error",
      icon: SnackbarIcons.Error,
      iconColor: "black",
    });
    isBusy.value = false;
    return;
  }

  sechatStore.showSnackbar({
    snackbar: true,
    text: "All subscriptions deleted",
    timeout: 2000,
    color: "success",
    icon: SnackbarIcons.Success,
    iconColor: "black",
  });
  userStore.subscribedToPush = false;
  isBusy.value = false;
};
</script>

<style scoped></style>
