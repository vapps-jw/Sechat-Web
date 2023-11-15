import { E2EStatusMessages } from "~/utilities/e2eEnums";
import { scrollToBottom } from "~/utilities/documentFunctions";
import {
  ChatViews,
  SignalRHubMethods,
  LocalStoreTypes,
  VisibilityStates,
} from "~~/utilities/globalEnums";

export const useRoomHandlers = () => {
  const userStore = useUserStore();
  const chatStore = useSechatChatStore();
  const signalRStore = useSignalRStore();
  const chatApi = useChatApi();
  const e2e = useE2Encryption();

  // Rooms

  const onRoomUpdatedEvent = (room: IRoom) => {
    console.warn("Handling Room Updated Event", room);

    const key = e2e.getKey(room.id, LocalStoreTypes.E2EROOMS);
    if (key) {
      room.hasKey = true;
    }
    chatStore.updateRoom(room);
  };

  const onRoomDeletedEvent = (message: IResourceGuid) => {
    console.warn("Handling Room Delete Event", message);
    chatStore.deleteRoom(message.id);
    e2e.removeKey(message.id, LocalStoreTypes.E2EROOMS);
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

  // Messages

  const onUserTypingInRoom = (message: IRoomMessageTypingUser) => {
    console.warn("Incoming UserTypingInRoom", message);
    if (chatStore.activeRoomId !== message.roomId) {
      return;
    }
    chatStore.addTypingUser(message.username);
  };

  const onMessageDeleted = (data: IMessageDeleted) => {
    console.warn("Handling MessageDeleted", data);
    chatStore.deleteMessageFromRoom(data);
    if (chatStore.activeRoomId && chatStore.activeRoomId === data.roomId) {
      scrollToBottom("chatView");
    }
  };

  const onMessageWasViewed = (message: IRoomMessageUserActionMessage) => {
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

  const onMessagesWereViewed = (message: IRoomUserActionMessage) => {
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

  const onIncomingMessage = async (message: IMessage) => {
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
      chatStore.addNewRoomMessage(message);
      chatStore.removeTypingUser(message.nameSentBy);
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
      chatStore.addNewRoomMessage(message);
      chatApi.markMessageAsViewed(message.roomId, message.id);
      chatStore.removeTypingUser(message.nameSentBy);
      scrollToBottom("chatView");
      return;
    }

    chatStore.addNewRoomMessage(message);
    chatStore.removeTypingUser(message.nameSentBy);

    if (
      chatStore.getActiveRoomId &&
      message.roomId === chatStore.getActiveRoomId
    ) {
      scrollToBottom("chatView");
    }
  };

  return {
    onUserTypingInRoom,
    onMessageDeleted,
    onRoomUpdatedEvent,
    onRoomDeletedEvent,
    onIncomingMessage,
    onMessagesWereViewed,
    onMessageWasViewed,
    handleUserAddedToRoom,
    handleUserRemovedFromRoom,
  };
};
