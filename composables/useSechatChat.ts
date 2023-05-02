import { scrollToBottom } from "~~/utilities/documentFunctions";
import { ChatViews } from "~~/utilities/globalEnums";

export const useSechatChat = () => {
  const userStore = useUserStore();
  const chatStore = useSechatChatStore();
  const chatApi = useChatApi();

  // User Connections

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

  const handleIncomingMessage = (message: IMessage) => {
    console.warn(
      "--> Incoming Message Event Handle",
      message,
      chatStore.activeRoomId
    );

    message.wasViewed = false;
    if (message.nameSentBy === userStore.getUserName) {
      message.wasViewed = true;
    }

    if (
      chatStore.getActiveRoomId &&
      message.roomId === chatStore.getActiveRoomId &&
      chatStore.getActiveChatTab === ChatViews.Messages
    ) {
      message.wasViewed = true;
    }

    if (
      chatStore.getActiveRoomId &&
      message.roomId === chatStore.getActiveRoomId &&
      chatStore.getActiveChatTab === ChatViews.Messages &&
      message.nameSentBy !== userStore.getUserName
    ) {
      chatApi.markMessageAsViewed(message.roomId, message.id);
    }

    chatStore.addNewMessage(message);

    if (message.roomId === chatStore.activeRoomId) {
      console.warn("--> Scrolling from handleIncomingMessage");
      scrollToBottom("chatView");
    }
  };

  const handleMessagesWereViewed = (message: IRoomUserActionMessage) => {
    console.warn("--> Incoming MessagesWereViewed", message);
    chatStore.markRoomMessagesAsViewed(message.userName, message.roomId);
    scrollToBottom("chatView");
  };

  const handleMessageWasViewed = (message: IRoomMessageUserActionMessage) => {
    console.warn("--> Incoming MessageWasViewed", message);
    chatStore.markRoomMessageAsViewed(
      message.userName,
      message.roomId,
      message.messageId
    );
    scrollToBottom("chatView");
  };

  return {
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
  };
};
