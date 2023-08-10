import { PushNotificationTypes } from "~~/utilities/globalEnums";

export const useSechatApp = () => {
  const addLocalStoreItem = (data: any, type: string): LocalStoreItem => {
    if (!process.client) {
      console.error(process);
      return;
    }
    if (!process.client) {
      console.error(process);
      return;
    }

    console.log("Adding Item", type);
    const newData = JSON.stringify(data);
    localStorage.setItem(type, newData);
  };

  const getLocalStoreItem = (type: string): any => {
    if (!process.client) {
      console.error(process);
      return;
    }
    const storedData = localStorage.getItem(type);
    if (!storedData) {
      return null;
    }
    return JSON.parse(storedData) as any;
  };

  const removeLocalStoreItem = (type: string) => {
    if (!process.client) {
      console.error(process);
      return;
    }
    const storedData = localStorage.getItem(type);
    if (!storedData) {
      console.warn("Item not found");
      return;
    }
    console.log("Removing Item", type);
    localStorage.removeItem(type);
  };

  const clearNotifications = async () => {
    if ("serviceWorker" in navigator) {
      console.warn("Clearing notifications...");
      const registration = await navigator.serviceWorker.getRegistration();
      const currentNotifications = await registration.getNotifications();
      currentNotifications.forEach((n) => {
        console.warn("Closing current notification", String(n.title));
        n.close();
      });
    }
  };

  const clearVideoCallNotifications = async () => {
    if ("serviceWorker" in navigator) {
      console.warn("Clearing notifications...");
      const registration = await navigator.serviceWorker.getRegistration();
      const currentNotifications = await registration.getNotifications();
      const notificationsToClose = currentNotifications.filter(
        (n) => n.title === PushNotificationTypes.VideoCall
      );
      notificationsToClose.forEach((n) => {
        console.warn("Closing current notification", String(n.title));
        n.close();
      });
    }
  };

  return {
    addLocalStoreItem,
    getLocalStoreItem,
    removeLocalStoreItem,
    clearVideoCallNotifications,
    clearNotifications,
  };
};
