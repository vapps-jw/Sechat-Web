export const scrollToBottom = (elementId: string) => {
  const chatSection = document.getElementById(elementId);

  if (chatSection) {
    setTimeout(() => {
      chatSection.scrollTop = chatSection.scrollHeight;
    }, 0);
  }
};
