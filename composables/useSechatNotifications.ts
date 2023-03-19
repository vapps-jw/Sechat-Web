export const useSechatNotifications = () => {
  const newMessageNotification = (message: INewMessage) => {
    if (
      document.visibilityState === "visible" ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    console.warn("New message notification triggered", message);
    const notifTitle = message.roomName;
    const notifBody = `From ${message.sender}: ${message.text}`;
    const notifImg = "icons/icon_64x64.png";
    const options = {
      body: notifBody,
      icon: notifImg,
    };

    let notification = new Notification(notifTitle, options);
    notification.onclick = () => {
      notification.close();
      window.parent.focus();
    };
  };

  const permissionGrantedNotification = () => {
    if (Notification.permission !== "granted") {
      return;
    }

    console.warn("permissionGrantedNotification notification triggered");
    const notifTitle = "Notifications Ready";
    const notifBody = "Sechat will be pinging you now";
    const notifImg = "icons/icon_64x64.png";
    const options = {
      body: notifBody,
      icon: notifImg,
    };

    let notification = new Notification(notifTitle, options);
    notification.onclick = () => {
      notification.close();
      window.parent.focus();
    };
  };

  const testNotification = () => {
    if (Notification.permission !== "granted") {
      return;
    }

    const notifTitle = "Test Notification";
    const notifBody = `Permission Status: ${Notification.permission}`;
    const notifImg = "icons/icon_64x64.png";
    const options = {
      body: notifBody,
      icon: notifImg,
    };

    let notification = new Notification(notifTitle, options);
    notification.onclick = () => {
      notification.close();
      window.parent.focus();
    };
  };

  return {
    newMessageNotification,
    permissionGrantedNotification,
    testNotification,
  };
};
