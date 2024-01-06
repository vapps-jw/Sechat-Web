import { SnackbarIcons } from "~/utilities/globalEnums";
import { urlBase64ToUint8Array } from "~/utilities/stringFunctions";

export const useSechatNotifications = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const sechatStore = useSechatAppStore();

  const checkSubscription = async (): Promise<boolean> => {
    console.warn("Checking subscription to PUSH");
    let supported = true;

    await Notification.requestPermission().then((result) => {
      if (result !== "granted") {
        userStore.subscribedToPush = false;
        supported = false;
        console.error("PUSH Denied");
      }
    });

    console.warn("PUSH support", supported);
    if (!supported) {
      return;
    }

    console.warn("Subscribing to PUSH");
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
      console.log("Error when registering Push:", error.data.value);
      sechatStore.showSnackbar({
        snackbar: true,
        text: "Error when registering notifications",
        timeout: 2000,
        color: "error",
        icon: SnackbarIcons.Error,
        iconColor: "black",
      });
      return;
    }

    const subscriptionPayload = JSON.stringify(subscription);
    console.log("Sending Push Subscription:", subscriptionPayload);
    const { error: apiError, data: checkResult } = await useFetch<boolean>(
      `${config.public.apiBase}/notifications/is-subscribed`,
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
      return false;
    }

    console.warn("Push check result", checkResult);
    return checkResult.value;
  };

  return {
    checkSubscription,
  };
};
