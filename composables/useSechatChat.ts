import { getInitials, stringToColor } from "~/utilities/stringFunctions";
import { ChatViews, SignalRHubMethods } from "~~/utilities/globalEnums";

export const useSechatChat = () => {
  const userStore = useUserStore();
  const chatStore = useSechatChatStore();
  const chatApi = useChatApi();

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

    data.initials = getInitials(data.displayName);
    data.color = stringToColor(data.displayName);

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

  const loadUserConnections = (data: IContactRequest[]) => {
    console.log("--> Adding user connecitons to the Store", data);
    data.forEach((uc) => {
      if (uc.invitedName === userStore.getUserName) {
        uc.displayName = uc.inviterName;
      } else {
        uc.displayName = uc.invitedName;
      }
    });
    chatStore.loadContacts(data);
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
    chatStore.updateRoom(room);
  };

  const handleUserAddedToRoom = (room: IRoom) => {
    console.warn("--> Handling UserAddedToRoom Event", room);
    chatStore.addUserToRoom(room);
  };

  const handleUserRemovedFromRoom = (options: IUserRoomOptions) => {
    console.warn("--> Handling UserRemovedFromRoom Event", options);

    if (userStore.getUserName === options.userName) {
      console.warn("--> Current User is removed from room", options);
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

  const loadRooms = (data: IRoom[]) => {
    console.log("--> Adding room to the Store", data);
    chatStore.loadRooms(data);
  };

  const selectRoom = (room: IRoom) => {
    console.log("--> Room selected", room);
    chatStore.selectRoom(room.id);
  };

  // Messages

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

  const onIncomingMessage = (connection: signalR.HubConnection) => {
    console.log("--> Connecting IncomingMessage event");
    connection.on(SignalRHubMethods.MessageIncoming, handleIncomingMessage);
  };

  const handleIncomingMessage = (message: IMessage) => {
    console.warn(
      "--> Incoming Message Event Handle",
      message,
      chatStore.activeRoomId
    );

    message.wasViewed = false;
    if (message.nameSentBy === userStore.getUserName) {
      message.wasViewed = true;
      chatStore.addNewMessage(message);
      return;
    }

    if (
      chatStore.getActiveRoomId &&
      message.roomId === chatStore.getActiveRoomId &&
      chatStore.getActiveChatTab === ChatViews.Messages &&
      message.nameSentBy !== userStore.getUserName
    ) {
      message.wasViewed = true;
      chatStore.addNewMessage(message);
      chatApi.markMessageAsViewed(message.roomId, message.id);
      return;
    }

    chatStore.addNewMessage(message);
  };

  const handleMessagesWereViewed = (message: IRoomUserActionMessage) => {
    console.warn("--> Incoming MessagesWereViewed", message);
    chatStore.markRoomMessagesAsViewed(message.userName, message.roomId);
  };

  const handleMessageWasViewed = (message: IRoomMessageUserActionMessage) => {
    console.warn("--> Incoming MessageWasViewed", message);
    chatStore.markRoomMessageAsViewed(
      message.userName,
      message.roomId,
      message.messageId
    );
  };

  // SignalR Event handlers

  return {
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
    loadRooms,
    selectRoom,
    handleUpdateRoom,
    handleIncomingMessage,
    handleDeleteRoom,
    handleConnectionRequestReceived,
    handleConnectionUpdated,
    loadUserConnections,
    handleConnectionDelete,
    handleUserAddedToRoom,
    handleUserRemovedFromRoom,
    onContactStateChangedEvent,
  };
};
