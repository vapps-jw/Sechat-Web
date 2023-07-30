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
      const newKeyData: e2eKey = {
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

    chatStore.updateRoom(room);
  };

  const handleUserAddedToRoom = (room: IRoom) => {
    console.warn("Handling UserAddedToRoom Event", room);

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
    console.warn("Handling Room Delete Event Handled", message);
    chatStore.deleteRoom(message.id);
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

    // if (
    //   chatStore.availableRooms.find((r) => r.id === message.roomId) &&
    //   chatStore.availableRooms.find((r) => r.id === message.roomId)
    //     .encryptedByUser
    // ) {
    //   const hasKey = e2e.checkCookie(message.roomId, CustomCookies.E2E);
    //   if (!hasKey) return;

    //   try {
    //     const decryptedData = await chatApi.decryptMessage(
    //       message.id,
    //       message.text,
    //       message.roomId
    //     );
    //     message.text = decryptedData.message;
    //     message.error = decryptedData.error;
    //   } catch (error) {
    //     return;
    //   }
    // }

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

    console.log("Sending key", keyToShare);
    signalRStore.connection.send(SignalRHubMethods.ShareDMKey, keyToShare);
  };

  const onDMKeyIncoming = async (connection: signalR.HubConnection) => {
    console.log("Connecting DMKeyIncoming event");
    connection.on(SignalRHubMethods.DMKeyIncoming, handleDMKeyIncoming);
  };

  const handleDMKeyIncoming = async (message: DMSharedKey) => {
    console.warn("Incoming DMKeyIncoming ", message);

    const newKey: e2eKey = {
      key: message.key,
      id: message.id,
    };

    const result = e2e.addKey(newKey, LocalStoreTypes.E2EDM);
    console.log("Key Updated", result);
  };

  // const onRoomKeyRequested = async (connection: signalR.HubConnection) => {
  //   console.log("Connecting RoomKeyRequested event");
  //   connection.on(
  //     SignalRHubMethods.RoomKeyRequested,
  //     handleIncomingDirectMessage
  //   );
  // };

  // const onRoomKeyIncoming = async (connection: signalR.HubConnection) => {
  //   console.log("Connecting RoomKeyIncoming event");
  //   connection.on(
  //     SignalRHubMethods.RoomKeyIncoming,
  //     handleIncomingDirectMessage
  //   );
  // };

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
      console.error("Key is missing");
      return;
    }

    console.log("Decrypting message");
    message.text = e2e.decryptMessage(message.text, key);
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

  // E2E

  return {
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
