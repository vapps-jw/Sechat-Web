import { PushNotificationTypes } from "~~/utilities/globalEnums";

export const useSechatApp = () => {
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

  return {
    clearVideoCallNotifications,
    clearNotifications,
  };
};
