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
    const notifBody = message.sender;
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

  return { randomNotification, newMessageNotification };
};