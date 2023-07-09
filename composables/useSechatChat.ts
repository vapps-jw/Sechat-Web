import { scrollToBottom } from "~/utilities/documentFunctions";
import {
  ChatViews,
  SignalRHubMethods,
  VisibilityStates,
} from "~~/utilities/globalEnums";

export const useSechatChat = () => {
  const userStore = useUserStore();
  const chatStore = useSechatChatStore();
  const chatApi = useChatApi();
  const e2e = useE2Encryption();

  // Users

  const onUserConnectionDeleteEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting UserConnectionRemoved event");
    connection.on(SignalRHubMethods.ConnectionDeleted, handleConnectionDelete);
  };

  const onUserConnectionUpdatedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting UserConnectionUpdated event");
    connection.on(SignalRHubMethods.ConnectionUpdated, handleConnectionUpdated);
  };

  const onContactStateChangedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting ContactStateChanged");
    connection.on(SignalRHubMethods.ContactStateChanged, contactStateChanged);
  };

  const contactStateChanged = (data: IStringUserMessage) => {
    console.warn("--> Contact state changed", data);
    chatStore.updateContactState(data.userName, data.message);
  };

  const handleConnectionRequestReceived = (data: IContactRequest) => {
    console.warn("--> Connection Request Received", data);
    if (data.invitedName === userStore.getUserName) {
      data.displayName = data.inviterName;
    } else {
      data.displayName = data.invitedName;
    }

    chatStore.addContact(data);
  };

  const handleConnectionDelete = (resourceId: IResourceId) => {
    console.warn("--> Connection Delete Event Handled", resourceId);
    chatStore.deleteContact(resourceId);
  };

  const handleConnectionUpdated = (data: IContactRequest) => {
    console.log("--> User Connection Updated Event Handled", data);
    if (data.invitedName === userStore.getUserName) {
      data.displayName = data.inviterName;
    } else {
      data.displayName = data.invitedName;
    }
    chatStore.updateContact(data);
  };

  // Rooms

  const onConnectionRequestReceivedEvent = (
    connection: signalR.HubConnection
  ) => {
    console.log("--> Connecting ConnectionRequestReceived event");
    connection.on(
      SignalRHubMethods.ConnectionRequestReceived,
      handleConnectionRequestReceived
    );
  };

  const onRoomUpdatedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting RoomUpdated event");
    connection.on(SignalRHubMethods.RoomUpdated, handleUpdateRoom);
  };

  const onRoomDeletedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting RoomDeleted event");
    connection.on(SignalRHubMethods.RoomDeleted, handleDeleteRoom);
  };

  const addRoom = (room: IRoom) => {
    console.log("--> Adding room to the Store", room.name);
    chatStore.addRoom(room);
  };

  const removeRoom = (room: IRoom) => {
    console.log("--> Removing Room", room.name);
    chatStore.deleteRoom(room.id);
  };

  const handleUpdateRoom = (room: IRoom) => {
    console.warn("--> Handling Room Updated Event", room);

    const keyCheck = e2e.checkE2ECookie(room.id);
    if (keyCheck) {
      room.hasKey = true;
    }
    chatStore.updateRoom(room);
  };

  const handleUserAddedToRoom = (room: IRoom) => {
    console.warn("--> Handling UserAddedToRoom Event", room);
    if (room.encryptedByUser) {
      if (e2e.checkE2ECookie(room.id)) {
        room.hasKey = true;
        return;
      }
      room.hasKey = false;
    }
    chatStore.addUserToRoom(room);
  };

  const handleUserRemovedFromRoom = (options: IUserRoomOptions) => {
    console.warn("--> Handling UserRemovedFromRoom Event", options);

    if (userStore.getUserName === options.userName) {
      console.warn("--> Current User is removed from room", options);
      if (
        chatStore.availableRooms.find((r) => r.id === options.roomId)
          ?.encryptedByUser
      ) {
        e2e.removeRoomKey(options.roomId);
      }
      chatStore.deleteCurrentUserFromRoom(options);
      return;
    }

    console.warn("--> User is removed from room", options);
    chatStore.deleteUserFromRoom(options);
  };

  const handleDeleteRoom = (message: IResourceGuid) => {
    console.warn("--> Handling Room Delete Event Handled", message);
    chatStore.deleteRoom(message.id);
  };

  const selectRoom = (room: IRoom) => {
    console.log("--> Room selected", room);
    chatStore.selectRoom(room.id);
  };

  // Messages

  const onMessageDeleted = (connection: signalR.HubConnection) => {
    console.log("--> Connecting MessageDeleted event");
    connection.on(SignalRHubMethods.MessageDeleted, handleMessageDeleted);
  };

  const onMessageWasViewed = (connection: signalR.HubConnection) => {
    console.log("--> Connecting MessageWasViewed event");
    connection.on(SignalRHubMethods.MessageWasViewed, handleMessageWasViewed);
  };

  const onMessagesWereViewed = (connection: signalR.HubConnection) => {
    console.log("--> Connecting MessagesWereViewed event");
    connection.on(
      SignalRHubMethods.MessagesWereViewed,
      handleMessagesWereViewed
    );
  };

  const onIncomingMessage = async (connection: signalR.HubConnection) => {
    console.log("--> Connecting IncomingMessage event");
    connection.on(SignalRHubMethods.MessageIncoming, handleIncomingMessage);
  };

  const handleIncomingMessage = async (message: IMessage) => {
    console.warn(
      "--> Incoming Message Event Handle",
      message,
      chatStore.activeRoomId
    );

    if (
      chatStore.availableRooms.find((r) => r.id === message.roomId) &&
      chatStore.availableRooms.find((r) => r.id === message.roomId)
        .encryptedByUser
    ) {
      const hasKey = e2e.checkE2ECookie(message.roomId);
      if (!hasKey) return;

      try {
        const decryptedData = await chatApi.decryptMessage(
          message.id,
          message.text,
          message.roomId
        );
        message.text = decryptedData.message;
        message.error = decryptedData.error;
      } catch (error) {
        return;
      }
    }

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
    console.warn("--> Incoming MessagesWereViewed", message);
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
    console.warn("--> Incoming MessageWasViewed", message);
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
    console.warn("--> Handling MessageDeleted", data);
    chatStore.deleteMessageFromRoom(data);
    if (chatStore.activeRoomId && chatStore.activeRoomId === data.roomId) {
      scrollToBottom("chatView");
    }
  };

  // Direct Messages

  const onIncomingDirectMessage = async (connection: signalR.HubConnection) => {
    console.log("--> Connecting DirectMessageIncoming event");
    connection.on(
      SignalRHubMethods.DirectMessageIncoming,
      handleIncomingDirectMessage
    );
  };

  const onDirectMessageDeleted = (connection: signalR.HubConnection) => {
    console.log("--> Connecting DirectMessageDeleted event");
    connection.on(
      SignalRHubMethods.DirectMessageDeleted,
      handleDirectMessageDeleted
    );
  };

  const onDirectMessageWasViewed = (connection: signalR.HubConnection) => {
    console.log("--> Connecting DirectMessageWasViewed event");
    connection.on(
      SignalRHubMethods.DirectMessageWasViewed,
      handleDirectMessageWasViewed
    );
  };

  const onDirectMessagesWereViewed = (connection: signalR.HubConnection) => {
    console.log("--> Connecting DirectMessagesWereViewed event");
    connection.on(
      SignalRHubMethods.DirectMessagesWereViewed,
      handleDirectMessagesWereViewed
    );
  };

  const onContactUpdateRequired = (connection: signalR.HubConnection) => {
    console.log("--> Connecting ContactUpdateRequired event");
    connection.on(
      SignalRHubMethods.ContactUpdateRequired,
      handleContactUpdateRequired
    );
  };

  const handleContactUpdateRequired = async (
    message: IContactUpdateRequired
  ) => {
    console.warn("--> Incoming ContactUpdateRequired", message);
    const updatedContact = await chatApi.getContact(message.contactId);
    chatStore.updateContact(updatedContact);
  };

  const handleIncomingDirectMessage = async (message: IDirectMessage) => {
    console.warn(
      "--> Incoming Direct Message Event Handle",
      message,
      chatStore.activeContactId
    );

    if (
      chatStore.availableContacts.find((r) => r.id === message.contactId) &&
      chatStore.availableContacts.find((r) => r.id === message.contactId)
        .encryptedByUser
    ) {
      const hasKey = e2e.checkE2EDMCookie(message.contactId);
      if (!hasKey) return;

      try {
        const decryptedData = await chatApi.decryptDirectMessage(
          message.id,
          message.text,
          message.contactId
        );
        message.text = decryptedData.message;
        message.error = decryptedData.error;
      } catch (error) {
        return;
      }
    }

    if (
      document.visibilityState === VisibilityStates.VISIBLE &&
      chatStore.getActiveContactId &&
      message.contactId === chatStore.getActiveContactId &&
      chatStore.getActiveChatTab === ChatViews.Messages &&
      message.nameSentBy !== userStore.getUserName
    ) {
      console.warn("--> Marking Incoming Message as viewed");
      message.wasViewed = true;
      console.log("Adding new direct message", message);
      chatStore.addNewDirectMessage(message);
      chatApi.markDirectMessageAsViewed(message.contactId, message.id);
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

  const handleDirectMessagesWereViewed = (message: IDirectMessagesViewed) => {
    console.warn("--> Incoming DirectMessagesWereViewed", message);
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
    console.warn("--> Incoming DirectMessageWasViewed", message);
    chatStore.markDirectMessageAsViewed(message.contactId, message.messageId);
    if (
      chatStore.activeContactId &&
      chatStore.activeContactId === message.contactId
    ) {
      scrollToBottom("chatView");
    }
  };

  const handleDirectMessageDeleted = (data: IDirectMessageId) => {
    console.warn("--> Handling DirectMessageDeleted", data);
    chatStore.deleteMessageFromContact(data);
    if (
      chatStore.activeContactId &&
      chatStore.activeContactId === data.contactId
    ) {
      scrollToBottom("chatView");
    }
  };

  // SignalR Event handlers

  return {
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
