export const scrollToBottom = (elementId: string) => {
  const chatSection = document.getElementById(elementId);

  if (chatSection) {
    setTimeout(() => {
      chatSection.scrollTop = chatSection.scrollHeight;
    }, 0);
  }
};

export const listenToEvent = (doc) => {
  return {
    on: (type, selector, callback) => {
      doc.addEventListener(
        type,
        (event) => {
          if (!event.target.matches(selector)) return;
          callback.call(event.target, event);
        },
        false
      );
    },
  };
};
