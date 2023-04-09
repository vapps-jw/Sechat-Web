import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

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
  console.log("--> Current Notifications", currentNotifications);
  for (let i = 0; i < currentNotifications.length; i++) {
    currentNotifications[i].close();
  }

  const options = {
    body: String(data.options.body),
    icon: "icons/icon_64x64.png",
    badge: "images/message-notification-badge.png",
    tag: "Sechat",
    vibrate: [1000, 1000],
  };

  console.warn("--> Showing Notification...");
  self.registration.showNotification(String(data.title), options);
});

self.addEventListener("notificationclick", (event) => {
  const promiseChain = clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      if (windowClients.length > 0) {
        windowClients[0].focus();
      }
    });

  event.waitUntil(promiseChain);

  const clickedNotification = event.notification;
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
          clientIsFocused.focus();
          break;
        }
      }

      return clientIsFocused;
    });
}

async function checkClientIsVisible() {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  console.error("Checking visibility", windowClients);

  for (var i = 0; i < windowClients.length; i++) {
    if (windowClients[i].visibilityState === "visible") {
      return true;
    }
  }

  return false;
}
