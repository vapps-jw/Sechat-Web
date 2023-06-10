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
