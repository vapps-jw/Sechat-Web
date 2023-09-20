import { SignalRHubMethods, LocalStoreTypes } from "~~/utilities/globalEnums";

export const useContactHandlers = () => {
  const userStore = useUserStore();
  const chatStore = useSechatChatStore();
  const signalRStore = useSignalRStore();
  const chatApi = useChatApi();
  const e2e = useE2Encryption();

  const onContactDeleteEvent = (resourceId: IResourceId) => {
    console.warn("Connection Delete Event Handled", resourceId);

    console.log("Removing key");
    e2e.removeKey(resourceId.id, LocalStoreTypes.E2EDM);

    console.log("Removing contact", resourceId);
    chatStore.deleteContact(resourceId);
  };

  const onContactUpdatedEvent = (data: IContactRequest) => {
    console.warn("ContactUpdatedEvent", data);

    const dmKey = e2e.getKey(data.id, LocalStoreTypes.E2EDM);
    console.log("DM Key", dmKey);
    if (dmKey) {
      data.hasKey = true;
    }

    if (data.invitedName === userStore.getUserName) {
      data.displayName = data.inviterName;
    } else {
      data.displayName = data.invitedName;
    }
    chatStore.updateContact(data);
  };

  const onContactStateChangedEvent = (data: IStringUserMessage) => {
    console.warn("Contact state changed", data);

    const contact = chatStore.availableContacts.find(
      (c) => c.displayName === data.userName
    );
    if (!contact.approved || contact.blocked) {
      return;
    }

    // Check if there are any missing keys that other user can provide
    const missingKeys = e2e.getMissingKeys();
    if (missingKeys.length > 0) {
      missingKeys.forEach((missingKey) => {
        if (missingKey.keyHolders.some((kh) => kh === data.userName)) {
          if (missingKey.type === LocalStoreTypes.E2EDM) {
            const request: DMKeyRequest = {
              id: missingKey.id as number,
              receipient: userStore.getUserName,
              keyHolder: data.userName,
            };

            signalRStore.connection.send(
              SignalRHubMethods.RequestDMKey,
              request
            );
          }
          if (missingKey.type === LocalStoreTypes.E2EROOMS) {
            const request: RoomKeyRequest = {
              id: missingKey.id as string,
              receipient: userStore.getUserName,
            };

            signalRStore.connection.send(
              SignalRHubMethods.RequestRoomKey,
              request
            );
          }
        }
      });
    }

    chatStore.updateContactState(data.userName, data.message);
  };

  const onContactRequestReceivedEvent = async (data: IContactRequest) => {
    console.warn("Connection Request Received", data);
    if (data.invitedName === userStore.getUserName) {
      data.displayName = data.inviterName;
    } else {
      data.displayName = data.invitedName;
      console.log("Calling for new key");
      const key = await e2e.getNewKey();
      const newKeyData: E2EKey = {
        id: data.id,
        key: key,
      };
      console.log("Saving new key");
      const result = e2e.addKey(newKeyData, LocalStoreTypes.E2EDM);
      console.log("Updated keys", result);
    }

    console.log("Adding Contact", data);
    chatStore.addContact(data);
  };

  const onContactUpdateRequired = async (message: IContactUpdateRequired) => {
    console.warn("Incoming ContactUpdateRequired", message);
    const updatedContact = await chatApi.getContact(message.contactId);
    e2e.tryDecryptContact(updatedContact);
    chatStore.updateContact(updatedContact);
  };

  return {
    onContactUpdateRequired,
    onContactDeleteEvent,
    onContactUpdatedEvent,
    onContactRequestReceivedEvent,
    onContactStateChangedEvent,
  };
};
