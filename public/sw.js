import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

self.addEventListener("push", async (e) => {
  const data = e.data.json();
  console.log("Push Recieved...", data);

  if (Notification.permission !== "granted") {
    console.error("Push Denied...");
    return;
  }

  if (await checkClientIsVisible()) {
    console.error("Window Visible...");
    return;
  }

  const options = {
    body: String(data.options.body),
    icon: "icons/icon_64x64.png",
    tag: "Sechat",
    vibrate: [200, 100, 50],
  };

  console.warn("Showing Notification...");
  self.registration.showNotification(String(data.title), options);
});

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
