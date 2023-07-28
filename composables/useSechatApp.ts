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

  return {
    clearVideoCallNotifications,
    clearNotifications,
    pingServer,
    startPing,
    stopPing,
  };
};
