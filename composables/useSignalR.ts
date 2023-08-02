import * as signalR from "@microsoft/signalr";
import {
  CustomCookies,
  LocalStoreTypes,
  SignalRHubMethods,
} from "~~/utilities/globalEnums";

export const useSignalR = () => {
  const sechatStore = useSechatAppStore();
  const config = useRuntimeConfig();
  const sechatChatStore = useSechatChatStore();
  const userStore = useUserStore();
  const signalRStore = useSignalRStore();
  const videoCalls = useVideoCall();
  const chatApi = useChatApi();
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
          console.log("Reconnecting ...");
          sechatStore.updateLoadingOverlay(true);
          return 1000;
        },
      })
      .build();

    // Calls

    videoCalls.onVideoCallApprovedEvent(connection);
    videoCalls.onVideoCallRejectedEvent(connection);
    videoCalls.onVideoCallRequestedEvent(connection);
    videoCalls.onVideoCallTerminatedEvent(connection);
    videoCalls.onICECandidateIncomingEvent(connection);
    videoCalls.onWebRTCOfferIncomingEvent(connection);
    videoCalls.onWebRTCAnswerIncomingEvent(connection);
    videoCalls.onWebRTCScreenShareStateChangeEvent(connection);

    roomHandlers.onMessageWasViewed(connection);
    roomHandlers.onMessagesWereViewed(connection);
    roomHandlers.onIncomingMessage(connection);
    roomHandlers.onRoomDeletedEvent(connection);
    roomHandlers.onRoomUpdatedEvent(connection);
    roomHandlers.onMessageDeleted(connection);

    // Contacts

    contactHandlers.onContactStateChangedEvent(connection);
    contactHandlers.onContactRequestReceivedEvent(connection);
    contactHandlers.onContactUpdateRequired(connection);
    contactHandlers.onContactDeleteEvent(connection);
    contactHandlers.onContactUpdatedEvent(connection);

    // DM

    dmHandlers.onIncomingDirectMessage(connection);
    dmHandlers.onDirectMessageWasViewed(connection);
    dmHandlers.onDirectMessagesWereViewed(connection);
    dmHandlers.onDirectMessageDeleted(connection);

    _onUserAddedToRoomEvent(connection);
    _onUserRemovedFromRoomEvent(connection);

    // E2E

    e2eHandlers.onDMKeyRequested(connection);
    e2eHandlers.onDMKeyIncoming(connection);
    e2eHandlers.onRoomKeyRequested(connection);
    e2eHandlers.onRoomKeyIncoming(connection);

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
      connection.off(SignalRHubMethods.ConnectionRequestReceived);
      connection.off(SignalRHubMethods.ConnectionUpdated);
      connection.off(SignalRHubMethods.ConnectionDeleted);
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

      console.warn("Connection Closed - connection.onclose");
    });

    connection.onreconnected(async (connectionId) => {
      try {
        sechatStore.updateLoadingOverlay(true);

        // Get the updates
        console.log("Reconnected, getting state ...", connectionId);
        await Promise.all([
          chatApi
            .getConstacts()
            .then((res) => sechatChatStore.loadContacts(res)),
          chatApi.getRooms().then((res) => {
            sechatChatStore.loadRooms(res);
          }),
        ]);

        console.log("Reconnected, connectiong to Rooms ...");
        _connectToRooms(sechatChatStore.availableRooms.map((r) => r.id));
      } catch (error) {
        console.error("Fetch State Failed", error);
      } finally {
        sechatStore.updateLoadingOverlay(false);
      }
    });

    console.log("Starting Connection ...");
    await connection.start();

    signalRStore.updateConnectionValue(connection);
    if (
      signalRStore.connection.state === signalR.HubConnectionState.Connected
    ) {
      console.log("Connection Established, connectiong to Rooms ...");
      _connectToRooms(sechatChatStore.availableRooms.map((r) => r.id));
      return;
    }
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
      _connectToRooms(sechatChatStore.availableRooms.map((r) => r.id));
    }
    if (!signalRStore.connection) {
      await createNewConnection();
    }
  };

  const closeConnection = async () => {
    if (signalRStore.getConnection) {
      console.log("Closing connection, calling stop method");
      await signalRStore.closeConnection();
    } else {
      console.log("No connection to close");
    }
  };

  // Rooms

  const _onUserAddedToRoomEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting UserAddedToRoom event");
    connection.on(
      SignalRHubMethods.UserAddedToRoom,
      _handleUserAddedToRoomActions
    );
  };

  const _handleUserAddedToRoomActions = (data: IRoom) => {
    _connectToRoom(data.id);
    roomHandlers.handleUserAddedToRoom(data);
  };

  const _onUserRemovedFromRoomEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting UserRemovedFromRoom event");
    connection.on(
      SignalRHubMethods.UserRemovedFromRoom,
      _handleUserRemovedFromRoomActions
    );
  };

  const _connectToRooms = (roomIds: string[]) => {
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

  const _connectToRoom = (roomId: string) => {
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

  const _disconnectFromRoom = (roomId: string) => {
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

    // TODO: remove room key

    console.log("Disconnecting from Room", roomId);
    signalRStore.connection
      .invoke(SignalRHubMethods.DisconnectFromRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("Disconnected from room", result);
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
        _connectToRoom(newRoom.id);

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

  const _handleUserRemovedFromRoomActions = (options: IUserRoomOptions) => {
    console.warn("Handling UserRemovedFromRoom in SignalR", options);
    if (userStore.getUserName === options.userName) {
      console.warn("Active user is being removed - signalR");
      _disconnectFromRoom(options.roomId);
      roomHandlers.handleUserRemovedFromRoom(options);
      return;
    }

    // TODO: handle key removeal

    console.warn("Other user is being removed - signalR");
    roomHandlers.handleUserRemovedFromRoom(options);
  };

  return {
    closeConnection,
    createRoom,
    connect,
  };
};
