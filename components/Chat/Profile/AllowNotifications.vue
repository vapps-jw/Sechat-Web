<template>
  <v-btn
    :loading="isBusy"
    :disabled="isBusy"
    color="success"
    variant="flat"
    @click="subscribeToPush"
    >Subscribe</v-btn
  >
</template>

<script setup lang="ts">
import { SnackbarIcons } from "~/utilities/globalEnums";
import { urlBase64ToUint8Array } from "~/utilities/stringFunctions";

const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const isBusy = ref<boolean>(false);
const userStore = useUserStore();

const subscribeToPush = async () => {
  console.warn("Requesting Permission");

  if (isBusy.value) {
    return;
  } else {
    isBusy.value = true;
  }

  let supported = true;
  await Notification.requestPermission().then((result) => {
    if (result !== "granted") {
      console.error("Permission Denied!");
      sechatStore.showSnackbar({
        snackbar: true,
        text: "Permission Denied!",
        timeout: 1500,
        color: "error",
        icon: SnackbarIcons.Error,
        iconColor: "black",
      });
      supported = false;
    }
  });

  console.warn("PUSH support", supported);
  if (!supported) {
    isBusy.value = false;
    return;
  }

  console.warn("Subscribing to Push");
  let subscription;
  try {
    const register = await navigator.serviceWorker.ready;

    console.log(
      "Registering Push...",
      config.public.vapidKey,
      config.public.apiBase
    );
    subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.public.vapidKey),
    });
    console.log("Push Registered...");
  } catch (error) {
    console.log("Error when registering Push:", error.data?.value);
    sechatStore.showSnackbar({
      snackbar: true,
      text: "Error when registering notifications",
      timeout: 1500,
      color: "error",
      icon: SnackbarIcons.Error,
      iconColor: "black",
    });
    isBusy.value = false;
    return;
  }

  const subscriptionPayload = JSON.stringify(subscription);
  console.log("Sending Push Subscription:", subscriptionPayload);
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/notifications/push-subscribe`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: subscriptionPayload,
    }
  );

  if (apiError.value) {
    console.error("API Error - Subscription", apiError);

    if (apiError.value.statusCode !== 400) {
      sechatStore.showErrorSnackbar("Subscribe failed");
    } else {
      sechatStore.showWarningSnackbar(apiError.value.data);
      userStore.subscribedToPush = true;
    }

    isBusy.value = false;
    return;
  }

  sechatStore.showSnackbar({
    snackbar: true,
    text: "Subscribed",
    timeout: 1500,
    color: "success",
    icon: SnackbarIcons.Success,
    iconColor: "black",
  });
  userStore.subscribedToPush = true;
  isBusy.value = false;
};
</script>

<style scoped></style>
