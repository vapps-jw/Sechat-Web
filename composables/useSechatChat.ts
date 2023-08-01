import { E2EStatusMessages } from "~/utilities/e2eEnums";
import { scrollToBottom } from "~/utilities/documentFunctions";
import {
  ChatViews,
  SignalRHubMethods,
  LocalStoreTypes,
  VisibilityStates,
} from "~~/utilities/globalEnums";

export const useSechatChat = () => {
  const userStore = useUserStore();
  const chatStore = useSechatChatStore();
  const signalRStore = useSignalRStore();
  const chatApi = useChatApi();
  const e2e = useE2Encryption();

  // Users

  const onUserConnectionDeleteEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting UserConnectionRemoved event");
    connection.on(SignalRHubMethods.ConnectionDeleted, handleConnectionDelete);
  };

  const handleConnectionDelete = (resourceId: IResourceId) => {
    console.warn("Connection Delete Event Handled", resourceId);

    console.log("Removing key");
    e2e.removeKey(resourceId.id, LocalStoreTypes.E2EDM);

    console.log("Removing contact", resourceId);
    chatStore.deleteContact(resourceId);
  };

  const onUserConnectionUpdatedEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting UserConnectionUpdated event");
    connection.on(SignalRHubMethods.ConnectionUpdated, handleConnectionUpdated);
  };

  const handleConnectionUpdated = (data: IContactRequest) => {
    console.log("User Connection Updated Event Handled", data);
    if (data.invitedName === userStore.getUserName) {
      data.displayName = data.inviterName;
    } else {
      data.displayName = data.invitedName;
    }
    chatStore.updateContact(data);
  };

  const onContactStateChangedEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting ContactStateChanged");
    connection.on(SignalRHubMethods.ContactStateChanged, contactStateChanged);
  };

  const contactStateChanged = (data: IStringUserMessage) => {
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

  const onConnectionRequestReceivedEvent = async (
    connection: signalR.HubConnection
  ) => {
    console.log("Connecting ConnectionRequestReceived event");
    connection.on(
      SignalRHubMethods.ConnectionRequestReceived,
      handleConnectionRequestReceived
    );
  };

  const handleConnectionRequestReceived = async (data: IContactRequest) => {
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

  // Rooms

  const onRoomUpdatedEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting RoomUpdated event");
    connection.on(SignalRHubMethods.RoomUpdated, handleUpdateRoom);
  };

  const onRoomDeletedEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting RoomDeleted event");
    connection.on(SignalRHubMethods.RoomDeleted, handleDeleteRoom);
  };

  const addRoom = (room: IRoom) => {
    console.log("Adding room to the Store", room.name);
    chatStore.addRoom(room);
  };

  const removeRoom = (room: IRoom) => {
    console.log("Removing Room", room.name);
    chatStore.deleteRoom(room.id);
  };

  const handleUpdateRoom = (room: IRoom) => {
    console.warn("Handling Room Updated Event", room);

    const key = e2e.getKey(room.id, LocalStoreTypes.E2EROOMS);
    if (key) {
      room.hasKey = true;
    }
    chatStore.updateRoom(room);
  };

  const handleUserAddedToRoom = async (room: IRoom) => {
    console.warn("Handling UserAddedToRoom Event", room);

    const request: RoomKeyRequest = {
      id: room.id as string,
      receipient: userStore.getUserName,
    };

    signalRStore.connection.send(SignalRHubMethods.RequestRoomKey, request);
    chatStore.addUserToRoom(room);
  };

  const handleUserRemovedFromRoom = (options: IUserRoomOptions) => {
    console.warn("Handling UserRemovedFromRoom Event", options);

    if (userStore.getUserName === options.userName) {
      console.warn("Current User is removed from room", options);

      chatStore.deleteCurrentUserFromRoom(options);
      return;
    }

    console.warn("User is removed from room", options);
    chatStore.deleteUserFromRoom(options);
  };

  const handleDeleteRoom = (message: IResourceGuid) => {
    console.warn("Handling Room Delete Event", message);
    chatStore.deleteRoom(message.id);
    e2e.removeKey(message.id, LocalStoreTypes.E2EROOMS);
  };

  const selectRoom = (room: IRoom) => {
    console.log("Room selected", room);
    chatStore.selectRoom(room.id);
  };

  // Messages

  const onMessageDeleted = (connection: signalR.HubConnection) => {
    console.log("Connecting MessageDeleted event");
    connection.on(SignalRHubMethods.MessageDeleted, handleMessageDeleted);
  };

  const onMessageWasViewed = (connection: signalR.HubConnection) => {
    console.log("Connecting MessageWasViewed event");
    connection.on(SignalRHubMethods.MessageWasViewed, handleMessageWasViewed);
  };

  const onMessagesWereViewed = (connection: signalR.HubConnection) => {
    console.log("Connecting MessagesWereViewed event");
    connection.on(
      SignalRHubMethods.MessagesWereViewed,
      handleMessagesWereViewed
    );
  };

  const onIncomingMessage = async (connection: signalR.HubConnection) => {
    console.log("Connecting IncomingMessage event");
    connection.on(SignalRHubMethods.MessageIncoming, handleIncomingMessage);
  };

  const handleIncomingMessage = async (message: IMessage) => {
    console.warn(
      "Incoming Message Event Handle",
      message,
      chatStore.activeRoomId
    );

    const key = e2e.getKey(message.roomId, LocalStoreTypes.E2EROOMS);
    if (!key) {
      console.error("Key is missing for", message.roomId);
      return;
    }

    console.log("Decrypting message");

    const decrypted = e2e.decryptMessage(message.text, key);
    if (decrypted === E2EStatusMessages.DECRYPTION_ERROR) {
      message.error = true;
    }

    message.text = decrypted;
    message.decrypted = true;
    message.wasViewed = false;

    if (message.nameSentBy === userStore.getUserName) {
      message.wasViewed = true;
      chatStore.addNewMessage(message);
      scrollToBottom("chatView");
      return;
    }

    if (
      document.visibilityState === VisibilityStates.VISIBLE &&
      chatStore.getActiveRoomId &&
      message.roomId === chatStore.getActiveRoomId &&
      chatStore.getActiveChatTab === ChatViews.Messages &&
      message.nameSentBy !== userStore.getUserName
    ) {
      message.wasViewed = true;
      chatStore.addNewMessage(message);
      chatApi.markMessageAsViewed(message.roomId, message.id);
      scrollToBottom("chatView");
      return;
    }

    chatStore.addNewMessage(message);

    if (
      chatStore.getActiveRoomId &&
      message.roomId === chatStore.getActiveRoomId
    ) {
      scrollToBottom("chatView");
    }
  };

  const handleMessagesWereViewed = (message: IRoomUserActionMessage) => {
    console.warn("Incoming MessagesWereViewed", message);
    chatStore.markRoomMessagesAsViewed(message.userName, message.roomId);
    if (
      chatStore.activeRoomId &&
      message.roomId === chatStore.activeRoomId &&
      chatStore.activeChatTab === ChatViews.Messages
    ) {
      scrollToBottom("chatView");
    }
  };

  const handleMessageWasViewed = (message: IRoomMessageUserActionMessage) => {
    console.warn("Incoming MessageWasViewed", message);
    chatStore.markRoomMessageAsViewed(
      message.userName,
      message.roomId,
      message.messageId
    );
    if (chatStore.activeRoomId && chatStore.activeRoomId === message.roomId) {
      scrollToBottom("chatView");
    }
  };

  const handleMessageDeleted = (data: IMessageDeleted) => {
    console.warn("Handling MessageDeleted", data);
    chatStore.deleteMessageFromRoom(data);
    if (chatStore.activeRoomId && chatStore.activeRoomId === data.roomId) {
      scrollToBottom("chatView");
    }
  };

  // E2E

  const onDMKeyRequested = async (connection: signalR.HubConnection) => {
    console.log("Connecting DMKeyRequested event");
    connection.on(SignalRHubMethods.DMKeyRequested, handleDMKeyRequested);
  };

  const handleDMKeyRequested = async (message: DMKeyRequest) => {
    console.warn("Incoming DMKeyRequested ", message);

    const key = e2e.getKey(message.id, LocalStoreTypes.E2EDM);
    if (!key) {
      console.log("Key not found");
      return;
    }

    const keyToShare: DMSharedKey = {
      key: key.key,
      receipient: message.receipient,
      id: message.id,
    };

    console.log("Sending DM key", keyToShare);
    signalRStore.connection.send(SignalRHubMethods.ShareDMKey, keyToShare);
  };

  const onDMKeyIncoming = async (connection: signalR.HubConnection) => {
    console.log("Connecting DMKeyIncoming event");
    connection.on(SignalRHubMethods.DMKeyIncoming, handleDMKeyIncoming);
  };

  const handleDMKeyIncoming = async (message: DMSharedKey) => {
    console.warn("Incoming DMKeyIncoming ", message);

    const newKey: E2EKey = {
      key: message.key,
      id: message.id,
    };

    console.log("Updating key", newKey);
    const result = e2e.addKey(newKey, LocalStoreTypes.E2EDM);
    console.log("Key Updated", result);

    const contact = chatStore.availableContacts.find(
      (c) => c.id === message.id
    );
    e2e.tryDecryptContact(contact);
  };

  const onRoomKeyRequested = async (connection: signalR.HubConnection) => {
    console.log("Connecting RoomKeyRequested event");
    connection.on(SignalRHubMethods.RoomKeyRequested, handleOnRoomKeyRequested);
  };

  const handleOnRoomKeyRequested = (message: RoomKeyRequest) => {
    console.warn("Room Key requested");

    const key = e2e.getKey(message.id, LocalStoreTypes.E2EROOMS);
    if (!key) {
      console.log("Key not found");
      return;
    }

    const keyToShare: RoomSharedKey = {
      key: key.key,
      receipient: message.receipient,
      id: message.id,
    };

    console.log("Sending Room key", keyToShare);
    signalRStore.connection.send(SignalRHubMethods.ShareRoomKey, keyToShare);
  };

  const onRoomKeyIncoming = async (connection: signalR.HubConnection) => {
    console.log("Connecting RoomKeyIncoming event");
    connection.on(SignalRHubMethods.RoomKeyIncoming, handleRoomKeyIncoming);
  };

  const handleRoomKeyIncoming = (message: RoomSharedKey) => {
    console.warn("Room Key received", message);

    const newKey: E2EKey = {
      key: message.key,
      id: message.id,
    };

    const result = e2e.addKey(newKey, LocalStoreTypes.E2EROOMS);
    console.log("Key Updated", result);

    const room = chatStore.availableRooms.find((c) => c.id === message.id);
    e2e.tryDecryptRoom(room);
  };

  // Direct Messages

  const onIncomingDirectMessage = async (connection: signalR.HubConnection) => {
    console.log("Connecting DirectMessageIncoming event");
    connection.on(
      SignalRHubMethods.DirectMessageIncoming,
      handleIncomingDirectMessage
    );
  };

  const handleIncomingDirectMessage = async (message: IDirectMessage) => {
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

  const onDirectMessageDeleted = (connection: signalR.HubConnection) => {
    console.log("Connecting DirectMessageDeleted event");
    connection.on(
      SignalRHubMethods.DirectMessageDeleted,
      handleDirectMessageDeleted
    );
  };

  const handleDirectMessageDeleted = (data: IDirectMessageId) => {
    console.warn("Handling DirectMessageDeleted", data);
    chatStore.deleteMessageFromContact(data);
    if (
      chatStore.activeContactId &&
      chatStore.activeContactId === data.contactId
    ) {
      scrollToBottom("chatView");
    }
  };

  const onDirectMessageWasViewed = (connection: signalR.HubConnection) => {
    console.log("Connecting DirectMessageWasViewed event");
    connection.on(
      SignalRHubMethods.DirectMessageWasViewed,
      handleDirectMessageWasViewed
    );
  };

  const onDirectMessagesWereViewed = (connection: signalR.HubConnection) => {
    console.log("Connecting DirectMessagesWereViewed event");
    connection.on(
      SignalRHubMethods.DirectMessagesWereViewed,
      handleDirectMessagesWereViewed
    );
  };

  const handleDirectMessagesWereViewed = (message: IDirectMessagesViewed) => {
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

  const onContactUpdateRequired = (connection: signalR.HubConnection) => {
    console.log("Connecting ContactUpdateRequired event");
    connection.on(
      SignalRHubMethods.ContactUpdateRequired,
      handleContactUpdateRequired
    );
  };

  const handleContactUpdateRequired = async (
    message: IContactUpdateRequired
  ) => {
    console.warn("Incoming ContactUpdateRequired", message);
    const updatedContact = await chatApi.getContact(message.contactId);
    chatStore.updateContact(updatedContact);
  };

  const handleDirectMessageWasViewed = (
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

  return {
    onRoomKeyRequested,
    onRoomKeyIncoming,
    onDMKeyIncoming,
    onDMKeyRequested,
    onContactUpdateRequired,
    onIncomingDirectMessage,
    onDirectMessageWasViewed,
    onDirectMessagesWereViewed,
    onDirectMessageDeleted,
    onMessageDeleted,
    onUserConnectionDeleteEvent,
    onUserConnectionUpdatedEvent,
    onConnectionRequestReceivedEvent,
    onRoomUpdatedEvent,
    onRoomDeletedEvent,
    onIncomingMessage,
    onMessagesWereViewed,
    onMessageWasViewed,
    handleMessageWasViewed,
    handleMessagesWereViewed,
    removeRoom,
    addRoom,
    selectRoom,
    handleUpdateRoom,
    handleIncomingMessage,
    handleDeleteRoom,
    handleConnectionRequestReceived,
    handleConnectionUpdated,
    handleConnectionDelete,
    handleUserAddedToRoom,
    handleUserRemovedFromRoom,
    onContactStateChangedEvent,
  };
};
