import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { PushNotificationTypes } from "~~/utilities/globalEnums";
import CryptoES from "crypto-es";

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

self.masterKey = null;

self.addEventListener("push", async (event) => {
  const data = event.data.json();
  console.warn("Service Worker >>> Push Recieved...", data);

  if (Notification.permission !== "granted") {
    console.error("Service Worker >>> Push Denied...");
    return;
  }

  const clientIsFocused = await isClientFocused();
  if (clientIsFocused) {
    console.warn("Service Worker >>> Window Visible...");
    return;
  }

  console.warn("Service Worker >>> Push notification received", data);
  let options = {};
  if (String(data.title) === PushNotificationTypes.VideoCall) {
    options = {
      body: String(data.options.body),
      icon: "icons/icon_64x64.png",
      badge: "icons/phone-badge.png",
      tag: "Sechat",
      vibrate: [1000],
    };
    await closeNotifications(data);
  } else if (String(data.title) === PushNotificationTypes.EventReminder) {
    options = {
      body: String(decryptMessage(data.options.body)),
      icon: "icons/icon_64x64.png",
      badge: "icons/calendar-star.png",
      tag: "Sechat",
      vibrate: [500, 500, 500, 500],
    };
  } else {
    options = {
      body: String(data.options.body),
      icon: "icons/icon_64x64.png",
      badge: "icons/message-badge.png",
      tag: "Sechat",
      vibrate: [500, 500, 500],
    };
    await closeNotifications(data);
  }

  console.warn(
    "Service Worker >>> Showing Notification...",
    String(data.title),
    options
  );
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

self.addEventListener("message", (event) => {
  const msg = event.data;
  console.warn(`Service Worker >>> Message received: ${msg.title}`, msg);
  self.masterKey = msg.value;

  console.warn("Service Worker >>> Master Key variable set", self.masterKey);
});

const closeNotifications = async (data) => {
  const currentNotifications = await self.registration.getNotifications();
  console.warn(
    "Service Worker >>> Current Notifications",
    currentNotifications,
    currentNotifications.length
  );

  const notificationsToClose = currentNotifications.filter(
    (n) =>
      n.title === String(data.title) && n.body === String(data.options.body)
  );

  console.warn(
    "Service Worker >>> Notifications to close",
    notificationsToClose
  );
  notificationsToClose.forEach((n) => {
    console.warn(
      "Service Worker >>> Closing current notification",
      String(data.title)
    );
    n.close();
  });
};

const decryptMessage = (data) => {
  try {
    console.warn("Service Worker >>> Decrypting", data, self.masterKey);
    if (!self.masterKey) {
      return "Calendar Event!";
    }
    var result = CryptoES.enc.Utf8.stringify(
      CryptoES.AES.decrypt(data, self.masterKey.key)
    );
    console.warn("Service Worker >>> Decryption Result", JSON.parse(result));
    if (!result) {
      return "Calendar Event!";
    }
    return JSON.parse(result).name;
  } catch (error) {
    console.error(error);
    return "Calendar Event!";
  }
};

function isClientFocused() {
  return clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      console.warn("Service Worker >>> Window Clients", windowClients);
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
