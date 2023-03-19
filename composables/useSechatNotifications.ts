export const useSechatNotifications = () => {
  const randomNotification = () => {
    if (
      document.visibilityState === "visible" ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    console.warn("Random notification triggered");
    const notifTitle = "TEST";
    const notifBody = `Test Body`;
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

    setTimeout(() => notification.close(), 2000);
  };

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

    setTimeout(() => notification.close(), 2000);
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

    setTimeout(() => notification.close(), 3000);
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

    setTimeout(() => notification.close(), 3000);
  };

  return {
    randomNotification,
    newMessageNotification,
    permissionGrantedNotification,
    testNotification,
  };
};
