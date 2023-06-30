import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { PushNotificationTypes } from "~~/utilities/globalEnums";

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

self.addEventListener("push", async (event) => {
  const data = event.data.json();
  console.log("Push Recieved...", data);

  if (Notification.permission !== "granted") {
    console.error("Push Denied...");
    return;
  }

  const clientIsFocused = await isClientFocused();
  if (clientIsFocused) {
    console.error("Window Visible...");
    return;
  }

  const currentNotifications = await self.registration.getNotifications();
  console.log(
    "--> Current Notifications",
    currentNotifications,
    currentNotifications.length
  );

  const notificationsToClose = currentNotifications.filter(
    (n) =>
      n.title === String(data.title) && n.body === String(data.options.body)
  );

  console.log("--> Notifications to close", notificationsToClose);
  notificationsToClose.forEach((n) => {
    console.log("--> Closing current notification", String(data.title));
    n.close();
  });

  console.log("--> Push notification received", data);
  let options = {};
  if (String(data.title) === PushNotificationTypes.VideoCall) {
    options = {
      body: String(data.options.body),
      icon: "icons/icon_64x64.png",
      badge: "icons/phone-badge.png",
      tag: "Sechat",
      vibrate: [1000],
    };
  } else {
    options = {
      body: String(data.options.body),
      icon: "icons/icon_64x64.png",
      badge: "icons/message-badge.png",
      tag: "Sechat",
      vibrate: [500, 500, 500],
    };
  }

  console.log("--> Showing Notification...", String(data.title), options);
  self.registration.showNotification(String(data.title), options);
});

self.addEventListener("notificationclick", (event) => {
  const clickedNotification = event.notification;

  if (clickedNotification.title === PushNotificationTypes.VideoCall) {
    clickedNotification.close();
    return;
  }

  const promiseChain = clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      if (windowClients.length > 0) {
        windowClients[0].focus();
      }
    });

  event.waitUntil(promiseChain);
  clickedNotification.close();
});

function isClientFocused() {
  return clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      console.warn("--> Window Clients", windowClients);
      let clientIsFocused = false;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.focused) {
          clientIsFocused = true;
          break;
        }
      }

      return clientIsFocused;
    });
}
