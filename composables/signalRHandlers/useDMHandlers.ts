import { E2EStatusMessages } from "~/utilities/e2eEnums";
import { scrollToBottom } from "~/utilities/documentFunctions";
import {
  ChatViews,
  SignalRHubMethods,
  LocalStoreTypes,
  VisibilityStates,
} from "~~/utilities/globalEnums";

export const useDMHandlers = () => {
  const userStore = useUserStore();
  const chatStore = useSechatChatStore();
  const chatApi = useChatApi();
  const e2e = useE2Encryption();

  const onIncomingDirectMessage = async (message: IDirectMessage) => {
    console.warn(
      "Incoming Direct Message Event Handle",
      message,
      chatStore.activeContactId
    );

    const key = e2e.getKey(message.contactId, LocalStoreTypes.E2EDM);
    if (!key) {
      console.error("Key is missing for", message.contactId);
      return;
    }

    console.log("Decrypting message");
    const decrypted = e2e.decryptMessage(message.text, key);
    if (decrypted === E2EStatusMessages.DECRYPTION_ERROR) {
      message.error = true;
    }
    message.text = decrypted;
    message.decrypted = true;

    if (
      document.visibilityState === VisibilityStates.VISIBLE &&
      chatStore.getActiveContactId &&
      message.contactId === chatStore.getActiveContactId &&
      chatStore.getActiveChatTab === ChatViews.Messages &&
      message.nameSentBy !== userStore.getUserName
    ) {
      console.warn("Marking Incoming Message as viewed");
      message.wasViewed = true;
      console.log("Adding new direct message", message);
      chatStore.addNewDirectMessage(message);
      if (!message.error) {
        chatApi.markDirectMessageAsViewed(message.contactId, message.id);
      }

      scrollToBottom("chatView");
      return;
    }

    console.log("Adding new direct message", message);
    chatStore.addNewDirectMessage(message);

    if (
      chatStore.getActiveContactId &&
      message.contactId === chatStore.getActiveContactId
    ) {
      scrollToBottom("chatView");
    }
  };

  const onDirectMessageDeleted = (data: IDirectMessageId) => {
    console.warn("Handling DirectMessageDeleted", data);
    chatStore.deleteMessageFromContact(data);
    if (
      chatStore.activeContactId &&
      chatStore.activeContactId === data.contactId
    ) {
      scrollToBottom("chatView");
    }
  };

  const onDirectMessageWasViewed = (
    message: IContactMessageUserActionMessage
  ) => {
    console.warn("Incoming DirectMessageWasViewed", message);
    chatStore.markDirectMessageAsViewed(message.contactId, message.messageId);
    if (
      chatStore.activeContactId &&
      chatStore.activeContactId === message.contactId
    ) {
      scrollToBottom("chatView");
    }
  };

  const onUserTypingDirectMessage = (message: IDirectMessageTypingUser) => {
    console.warn("Incoming onUserTypingDirectMessage", message);
    if (chatStore.activeContactId !== message.contactId) {
      return;
    }
    chatStore.addTypingUser(message.username);
  };

  const onDirectMessagesWereViewed = (message: IDirectMessagesViewed) => {
    console.warn("Incoming DirectMessagesWereViewed", message);
    chatStore.markDirectMessagesAsViewed(message.contactId);
    if (
      chatStore.activeContactId &&
      message.contactId === chatStore.activeContactId &&
      chatStore.activeChatTab === ChatViews.Messages
    ) {
      scrollToBottom("chatView");
    }
  };

  return {
    onUserTypingDirectMessage,
    onIncomingDirectMessage,
    onDirectMessageWasViewed,
    onDirectMessagesWereViewed,
    onDirectMessageDeleted,
  };
};
