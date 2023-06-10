import { SnackbarIcons } from "~~/utilities/globalEnums";
import { PushNotificationTypes } from "~~/utilities/globalEnums";

export const useSechatApp = () => {
  const config = useRuntimeConfig();
  const useAppStore = useSechatAppStore();

  const startPing = () => {
    useAppStore.pingServerInterval = setInterval(
      async () => await pingServer(),
      2000
    );
  };

  const stopPing = () => {
    clearInterval(useAppStore.pingServerInterval);
  };

  const clearNotifications = async () => {
    if ("serviceWorker" in navigator) {
      console.warn("--> Clearing notifications...");
      const registration = await navigator.serviceWorker.getRegistration();
      const currentNotifications = await registration.getNotifications();
      currentNotifications.forEach((n) => {
        console.warn("--> Closing current notification", String(n.title));
        n.close();
      });
    }
  };

  const clearVideoCallNotifications = async () => {
    if ("serviceWorker" in navigator) {
      console.warn("--> Clearing notifications...");
      const registration = await navigator.serviceWorker.getRegistration();
      const currentNotifications = await registration.getNotifications();
      const notificationsToClose = currentNotifications.filter(
        (n) => n.title === PushNotificationTypes.VideoCall
      );
      notificationsToClose.forEach((n) => {
        console.warn("--> Closing current notification", String(n.title));
        n.close();
      });
    }
  };

  const pingServer = async () => {
    console.log("--> Ping Server");
    await useFetch(`${config.public.apiBase}/status/ping-api`, {
      method: "GET",
      onResponse({ response }) {
        console.log("--> Ping Result", response.status);
      },
      onResponseError({ response }) {
        console.log("--> Ping Result", response.status);
      },
    });
  };

  const showSnackbar = (data: ISanckbar) => {
    console.log("--> Snackbar data", data);
    useAppStore.updateSnackbar(data);
  };

  const showSuccessSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 1500,
      color: "success",
      icon: SnackbarIcons.Success,
      iconColor: "black",
    });
  };

  const showInfoSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 1500,
      color: "primary",
      icon: SnackbarIcons.Info,
      iconColor: "white",
    });
  };

  const showWarningSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 1500,
      color: "warning",
      icon: SnackbarIcons.Warning,
      iconColor: "black",
    });
  };

  const showOfflineSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 1500,
      color: "error",
      icon: SnackbarIcons.Offline,
      iconColor: "black",
    });
  };

  const showDisconnectedSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 1500,
      color: "error",
      icon: SnackbarIcons.Disconnected,
      iconColor: "black",
    });
  };

  const showErrorSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 1500,
      color: "error",
      icon: SnackbarIcons.Error,
      iconColor: "black",
    });
  };

  return {
    clearVideoCallNotifications,
    clearNotifications,
    showSnackbar,
    showSuccessSnackbar,
    showWarningSnackbar,
    showErrorSnackbar,
    showInfoSnackbar,
    showOfflineSnackbar,
    showDisconnectedSnackbar,
    pingServer,
    startPing,
    stopPing,
  };
};
