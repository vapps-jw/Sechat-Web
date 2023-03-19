export const useSechatNotifications = () => {
  const isSubscribedToPush = useState<PushSubscription>(
    "isSubscribedToPush",
    () => {
      let subscribed;
      navigator.serviceWorker.ready.then((reg) => {
        // Do we already have a push message subscription?

        reg.pushManager
          .getSubscription()
          .then(function (subscription) {
            if (subscription) {
              console.log(
                "--> User is already subscribed to push notifications"
              );
            } else {
              console.log(
                "--> User is not yet subscribed to push notifications"
              );
            }
            subscribed = subscription;
          })
          .catch(function (err) {
            console.log("-->  Unable to get subscription details.", err);
          });
      });
      return subscribed;
    }
  );

  const subscribeToPush = () => {
    navigator.serviceWorker.ready.then(function (reg) {
      const subscribeParams = { userVisibleOnly: true };

      //Setting the public key of our VAPID key pair.
      const applicationServerKey = urlB64ToUint8Array("");
      subscribeParams.applicationServerKey = applicationServerKey;

      reg.pushManager
        .subscribe(subscribeParams)
        .then(function (subscription) {
          //isSubscribed = true;

          var p256dh = base64Encode(subscription.getKey("p256dh"));
          var auth = base64Encode(subscription.getKey("auth"));

          console.log(subscription);

          // $('#PushEndpoint').val(subscription.endpoint);
          // $('#PushP256DH').val(p256dh);
          // $('#PushAuth').val(auth);
        })
        .catch(function (e) {});
    });
  };

  const newMessageNotification = (message: INewMessage) => {
    if (
      document.visibilityState === "visible" ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    console.warn("--> Service Worker", navigator.serviceWorker);
    if (!navigator.serviceWorker) {
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      console.warn("New message notification triggered", message);
      const notifTitle = message.roomName;
      const notifBody = `From ${message.sender}: ${message.text}`;
      const notifImg = "icons/icon_64x64.png";

      registration.showNotification(notifTitle, {
        body: notifBody,
        icon: notifImg,
        tag: "Sechat",
      });
    });

    // let notification = new Notification(notifTitle, options);
    // notification.onclick = () => {
    //   notification.close();
    //   window.parent.focus();
    // };
  };

  function urlB64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function base64Encode(arrayBuffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
  }

  return {
    newMessageNotification,
  };
};
