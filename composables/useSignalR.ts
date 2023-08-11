import * as signalR from "@microsoft/signalr";
import { LocalStoreTypes, SignalRHubMethods } from "~~/utilities/globalEnums";

export const useSignalR = () => {
  const sechatStore = useSechatAppStore();
  const config = useRuntimeConfig();
  const sechatChatStore = useSechatChatStore();
  const userStore = useUserStore();
  const signalRStore = useSignalRStore();
  const videoCalls = useVideoCall();
  const e2e = useE2Encryption();
  const e2eHandlers = useE2EHandlers();
  const contactHandlers = useContactHandlers();
  const dmHandlers = useDMHandlers();
  const roomHandlers = useRoomHandlers();

  const createNewConnection = async () => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.apiBase}/chat-hub`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          console.warn("Reconnecting SignalR");
          return 1000;
        },
      })
      .build();

    // Calls

    connection.on(
      SignalRHubMethods.VideoCallApproved,
      videoCalls.videoCallApproved
    );
    connection.on(
      SignalRHubMethods.VideoCallRejected,
      videoCalls.videoCallRejected
    );
    connection.on(
      SignalRHubMethods.VideoCallRequested,
      videoCalls.videoCallRequestReceived
    );
    connection.on(
      SignalRHubMethods.VideoCallTerminated,
      videoCalls.videoCallTerminated
    );
    connection.on(
      SignalRHubMethods.ICECandidateIncoming,
      videoCalls.ICECandidateIncoming
    );
    connection.on(
      SignalRHubMethods.WebRTCOfferIncoming,
      videoCalls.offerIncoming
    );
    connection.on(
      SignalRHubMethods.WebRTCAnswerIncoming,
      videoCalls.answerIncoming
    );
    connection.on(
      SignalRHubMethods.ScreenShareStateChanged,
      videoCalls.screenShareToggledByOtherUser
    );

    // Rooms

    connection.on(
      SignalRHubMethods.MessageWasViewed,
      roomHandlers.onMessageWasViewed
    );
    connection.on(
      SignalRHubMethods.MessagesWereViewed,
      roomHandlers.onMessagesWereViewed
    );
    connection.on(
      SignalRHubMethods.MessageIncoming,
      roomHandlers.onIncomingMessage
    );
    connection.on(
      SignalRHubMethods.RoomDeleted,
      roomHandlers.onRoomDeletedEvent
    );
    connection.on(
      SignalRHubMethods.RoomUpdated,
      roomHandlers.onRoomUpdatedEvent
    );
    connection.on(
      SignalRHubMethods.MessageDeleted,
      roomHandlers.onMessageDeleted
    );

    // Contacts

    connection.on(
      SignalRHubMethods.ContactStateChanged,
      contactHandlers.onContactStateChangedEvent
    );
    connection.on(
      SignalRHubMethods.ContactRequestReceived,
      contactHandlers.onContactRequestReceivedEvent
    );
    connection.on(
      SignalRHubMethods.ContactUpdateRequired,
      contactHandlers.onContactUpdateRequired
    );
    connection.on(
      SignalRHubMethods.ContactDeleted,
      contactHandlers.onContactDeleteEvent
    );
    connection.on(
      SignalRHubMethods.ContactUpdated,
      contactHandlers.onContactUpdatedEvent
    );

    connection.on(
      SignalRHubMethods.UserAddedToRoom,
      handleUserAddedToRoomActions
    );
    connection.on(
      SignalRHubMethods.UserRemovedFromRoom,
      handleUserRemovedFromRoomActions
    );

    // DM

    connection.on(
      SignalRHubMethods.DirectMessageIncoming,
      dmHandlers.onIncomingDirectMessage
    );
    connection.on(
      SignalRHubMethods.DirectMessageWasViewed,
      dmHandlers.onDirectMessageWasViewed
    );
    connection.on(
      SignalRHubMethods.DirectMessagesWereViewed,
      dmHandlers.onDirectMessagesWereViewed
    );
    connection.on(
      SignalRHubMethods.DirectMessageDeleted,
      dmHandlers.onDirectMessageDeleted
    );

    // E2E

    connection.on(
      SignalRHubMethods.DMKeyRequested,
      e2eHandlers.onDMKeyRequested
    );
    connection.on(SignalRHubMethods.DMKeyIncoming, e2eHandlers.onDMKeyIncoming);

    connection.on(
      SignalRHubMethods.RoomKeyRequested,
      e2eHandlers.onRoomKeyRequested
    );
    connection.on(
      SignalRHubMethods.RoomKeyIncoming,
      e2eHandlers.onRoomKeyIncoming
    );

    connection.on(
      SignalRHubMethods.MasterKeyRequested,
      e2eHandlers.onMasterKeyRequested
    );
    connection.on(
      SignalRHubMethods.MasterKeyIncoming,
      e2eHandlers.onMasterKeyIncoming
    );

    // Disconnect from events on connection close
    connection.onclose(async () => {
      connection.off(SignalRHubMethods.SendScreenShareStateChange);
      connection.off(SignalRHubMethods.VideoCallApproved);
      connection.off(SignalRHubMethods.VideoCallRejected);
      connection.off(SignalRHubMethods.VideoCallRequested);
      connection.off(SignalRHubMethods.VideoCallTerminated);
      connection.off(SignalRHubMethods.ICECandidateIncoming);
      connection.off(SignalRHubMethods.WebRTCOfferIncoming);
      connection.off(SignalRHubMethods.WebRTCAnswerIncoming);
      connection.off(SignalRHubMethods.ContactStateChanged);
      connection.off(SignalRHubMethods.MessageWasViewed);
      connection.off(SignalRHubMethods.MessagesWereViewed);
      connection.off(SignalRHubMethods.MessageIncoming);
      connection.off(SignalRHubMethods.RoomDeleted);
      connection.off(SignalRHubMethods.UserAddedToRoom);
      connection.off(SignalRHubMethods.RoomUpdated);
      connection.off(SignalRHubMethods.UserRemovedFromRoom);
      connection.off(SignalRHubMethods.ContactRequestReceived);
      connection.off(SignalRHubMethods.ContactUpdated);
      connection.off(SignalRHubMethods.ContactDeleted);
      connection.off(SignalRHubMethods.MessageDeleted);

      connection.off(SignalRHubMethods.DirectMessageIncoming);
      connection.off(SignalRHubMethods.DirectMessageDeleted);
      connection.off(SignalRHubMethods.DirectMessageWasViewed);
      connection.off(SignalRHubMethods.DirectMessagesWereViewed);
      connection.off(SignalRHubMethods.ContactUpdateRequired);

      // E2E

      connection.off(SignalRHubMethods.DMKeyRequested);
      connection.off(SignalRHubMethods.DMKeyIncoming);

      connection.off(SignalRHubMethods.RoomKeyRequested);
      connection.off(SignalRHubMethods.RoomKeyIncoming);

      connection.off(SignalRHubMethods.MasterKeyRequested);
      connection.off(SignalRHubMethods.MasterKeyIncoming);

      console.warn("Connection Closed - connection.onclose");
    });

    connection.onreconnected(async (connectionId) => {
      try {
        console.warn("SIGNALR RECONNECTION TRIGGERED", connectionId);
        const roomIds = sechatChatStore.availableRooms.map((r) => r.id);
        if (roomIds.length > 0) {
          console.log("Connecting to rooms", connectionId);
          connectToRooms(roomIds);
        }
      } catch (error) {
        console.error("SIGNALR RECONNECTION ERROR", error);
      }
    });

    console.log("Starting Connection ...");
    await connection.start();
    signalRStore.updateConnectionValue(connection);
  };

  const connect = async () => {
    if (
      signalRStore.connection &&
      signalRStore.connection.state === signalR.HubConnectionState.Connected
    ) {
      console.log("Already Connected");
    }
    if (
      signalRStore.connection &&
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.log("Starting Current Connection, connecting to Rooms");
      await signalRStore.connection.start();
    }
    if (!signalRStore.connection) {
      await createNewConnection();
    }
  };

  // Rooms

  const handleUserAddedToRoomActions = (data: IRoom) => {
    connectToRoom(data.id);
    roomHandlers.handleUserAddedToRoom(data);
  };

  const connectToRooms = (roomIds: string[]) => {
    if (
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("Cant connect to Rooms");
      return;
    }

    if (roomIds.length == 0) {
      console.log("No rooms to connect with");
      return;
    }

    console.log("Connecting to Rooms", roomIds);
    signalRStore.connection
      .invoke(SignalRHubMethods.ConnectToRooms, {
        RoomIds: roomIds,
      })
      .then((result) => {
        console.log("Connected to rooms", result);
      });
  };

  const connectToRoom = (roomId: string) => {
    if (
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("Cant connect to Rooms");
      return;
    }

    if (!roomId) {
      console.warn("Incorect Room Id");
      return;
    }

    console.log("Connecting to Room", roomId);
    signalRStore.connection
      .invoke(SignalRHubMethods.ConnectToRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("Connected to room", result);
      });
  };

  const disconnectFromRoom = (roomId: string) => {
    if (
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("Cant disconnect from Room");
      return;
    }

    if (!roomId) {
      console.warn("Incorect Room Id");
      return;
    }

    console.log("Disconnecting from Room", roomId);
    signalRStore.connection
      .invoke(SignalRHubMethods.DisconnectFromRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("Disconnected from room", result);
        e2e.removeKey(roomId, LocalStoreTypes.E2EROOMS);
      });
  };

  const createRoom = (roomName: string) => {
    console.log("Connection state:", signalRStore.connection.state);
    console.log("SignalR Creating Room:", roomName);
    signalRStore.connection
      .invoke(SignalRHubMethods.CreateRoom, {
        RoomName: roomName,
      })
      .then(async (newRoom: IRoom) => {
        console.log("New room created", newRoom);

        newRoom.hasKey = true;
        sechatChatStore.addRoom(newRoom);
        connectToRoom(newRoom.id);

        console.log("Calling for new key");
        const key = await e2e.getNewKey();
        const newKeyData: E2EKey = {
          id: newRoom.id,
          key: key,
        };
        console.log("Saving new key", key);
        const result = e2e.addKey(newKeyData, LocalStoreTypes.E2EROOMS);
        console.log("Updated keys", result);

        sechatStore.showSuccessSnackbar("Room created");
        return newRoom.id;
      })
      .catch((err) => {
        if (err.message.indexOf("auth_expired") > 0) {
          console.log("Auth cookie expored");
          navigateTo("/user/login");
        } else {
          throw err;
        }
      });
  };

  // Room Handlers

  const handleUserRemovedFromRoomActions = (options: IUserRoomOptions) => {
    console.warn("Handling UserRemovedFromRoom in SignalR", options);
    if (userStore.getUserName === options.userName) {
      console.warn("Active user is being removed - signalR");
      disconnectFromRoom(options.roomId);
      roomHandlers.handleUserRemovedFromRoom(options);
      return;
    }

    console.warn("Other user is being removed - signalR");
    roomHandlers.handleUserRemovedFromRoom(options);
  };

  return {
    connectToRooms,
    connectToRoom,
    createRoom,
    connect,
  };
};
