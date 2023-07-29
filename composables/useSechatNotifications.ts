import { SnackbarIcons } from "~~/utilities/globalEnums";

export const useSechatNotifications = () => {
  const config = useRuntimeConfig();
  const sechatStore = useSechatAppStore();

  const notificationsAllowed = useState<boolean>(
    "notificationsAllowed",
    () => false
  );

  const unsubscribeFromPush = async () => {
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
      throw createError({
        ...apiError.value,
        statusMessage: "Failed to unsubscribe",
        statusCode: apiError.value.statusCode,
      });
    }

    sechatStore.showSnackbar({
      snackbar: true,
      text: "All subscriptions deleted",
      timeout: 2000,
      color: "success",
      icon: SnackbarIcons.Success,
      iconColor: "black",
    });
  };

  const subscribeToPush = async () => {
    console.warn("--> Requesting Permission");

    Notification.requestPermission().then((result) => {
      if (result !== "granted") {
        console.error("--> Permission Denied!");
        return;
      }
    });

    console.warn("--> Subscribing to Push");
    let subscription;
    try {
      const register = await navigator.serviceWorker.ready;

      console.log(
        "--> Registering Push...",
        config.public.vapidKey,
        config.public.apiBase
      );
      subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.public.vapidKey),
      });
      console.log("--> Push Registered...");
    } catch (error) {
      console.log("--> Error when registering Push:", error);
      return;
    }

    const subscriptionPayload = JSON.stringify(subscription);
    console.log("--> Sending Push Subscription:", subscriptionPayload);
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/notifications/push-subscribe`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: subscriptionPayload,
        onResponseError({ response }) {
          if (response.status === 400) {
            sechatStore.showSnackbar({
              snackbar: true,
              text: response._data,
              timeout: 2000,
              color: "warning",
              icon: SnackbarIcons.Warning,
              iconColor: "black",
            });
          } else {
            sechatStore.showSnackbar({
              snackbar: true,
              text: "Subscription Failed",
              timeout: 2000,
              color: "error",
              icon: SnackbarIcons.Error,
              iconColor: "black",
            });
          }
        },
      }
    );

    if (apiError.value) {
      console.error("--> API Error - Subscription");
      return;
    }

    sechatStore.showSnackbar({
      snackbar: true,
      text: "Subscribed",
      timeout: 2000,
      color: "success",
      icon: SnackbarIcons.Success,
      iconColor: "black",
    });
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return {
    notificationsAllowed,
    subscribeToPush,
    unsubscribeFromPush,
  };
};
