import * as signalR from "@microsoft/signalr";
import { VisibilityStates, SignalRState } from "~~/utilities/globalEnums";

export const useSignalR = () => {
  const appStore = useAppStore();
  const config = useRuntimeConfig();
  const chatStore = useChatStore();
  const userData = useUserData();
  const chatApi = useChatApi();

  const SignalRHubMethods = {
    SendMessage: "SendMessage",
    ConnectToRooms: "ConnectToRooms",
    ConnectToRoom: "ConnectToRoom",
    CreateRoom: "CreateRoom",
    MessageIncoming: "MessageIncoming",
    RoomDeleted: "RoomDeleted",
    ConnectionRequestReceived: "ConnectionRequestReceived",
    ConnectionDeleted: "ConnectionDeleted",
    ConnectionUpdated: "ConnectionUpdated",
    UserAddedToRoom: "UserAddedToRoom",
    UserRemovedFromRoom: "UserRemovedFromRoom",
    DisconnectFromRoom: "DisconnectFromRoom",
    RoomUpdated: "RoomUpdated",
  };

  const connection = useState<signalR.HubConnection>(
    "signalRConnection",
    () => null
  );

  const isConnected = computed(() => {
    if (
      connection.value &&
      connection.value.state === signalR.HubConnectionState.Connected
    ) {
      return true;
    }
    return false;
  });

  const connectionState = computed(() => {
    if (!connection.value) {
      return SignalRState.Disconnected;
    }
    if (connection.value.state === signalR.HubConnectionState.Connected) {
      return SignalRState.Connected;
    }
    if (
      connection.value.state === signalR.HubConnectionState.Connecting ||
      connection.value.state === signalR.HubConnectionState.Reconnecting
    ) {
      return SignalRState.Connecting;
    }
    return SignalRState.Disconnected;
  });

  const connectionPresent = computed(() => {
    if (connection.value) {
      return true;
    }
    return false;
  });

  const createNewConnection = async () => {
    connection.value = new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.apiBase}/chat-hub`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          console.log("--> Reconnecting ...");
          appStore.showLoadingOverlay();
          return 1000;
        },
      })
      .build();

    // Connect to events on connection build
    _onIncomingMessage();
    _onRoomDeletedEvent();
    _onUserAddedToRoomEvent();
    _onRoomUpdatedEvent();
    _onUserRemovedFromRoomEvent();
    _onConnectionRequestReceivedEvent();
    _onUserConnectionUpdatedEvent();
    _onUserConnectionDeleteEvent();

    // Disconnect from events on connection close
    connection.value.onclose(async () => {
      _offIncomingMessage();
      _offRoomDeletedEvent();
      _offUserAddedToRoomEvent();
      _offRoomUpdatedEvent();
      _offUserRemovedFromRoomEvent();
      _offConnectionRequestReceivedEvent();
      _offUserConnectionUpdatedEvent();
      _offUserConnectionDeleteEvent();
      console.warn("--> Connection Closed");
    });

    connection.value.onreconnected(async (connectionId) => {
      try {
        appStore.showLoadingOverlay();

        // Get the updates
        console.log("--> Reconnected, getting state ...");
        const { error: apiError, data: chatState } = await useFetch<IChatState>(
          `${config.public.apiBase}/chat/get-state`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (apiError.value) {
          throw createError({
            ...apiError.value,
            statusMessage: "Failed to pull state",
            statusCode: apiError.value.statusCode,
          });
        }

        chatStore.loadRooms(chatState.value.rooms);
        chatStore.loadUserConnections(chatState.value.userConnections);

        console.log("--> Reconnected, connectiong to Rooms ...");
        _connectToRooms(chatStore.getRooms.value.map((r) => r.id));
      } catch (error) {
      } finally {
        appStore.hideLoadingOverlay();
      }
    });

    console.log("--> Starting Connection ...");
    await connection.value.start();

    if (connection.value.state === signalR.HubConnectionState.Connected) {
      console.log("--> Connection Established, connectiong to Rooms ...");
      _connectToRooms(chatStore.getRooms.value.map((r) => r.id));
      return;
    }
  };

  const connect = async () => {
    if (
      connection.value &&
      connection.value.state === signalR.HubConnectionState.Connected
    ) {
      console.log("--> Already Connected");
      return;
    }
    if (!connection.value) {
      await createNewConnection();
    }
    if (
      connection.value &&
      connection.value.state !== signalR.HubConnectionState.Connected
    ) {
      console.log("--> Starting Current Connection, connecting to Rooms");
      await connection.value.start();
      _connectToRooms(chatStore.getRooms.value.map((r) => r.id));
    }
  };

  const closeConnection = async () => {
    if (connection.value) {
      console.log("--> Closing connection, calling stop method");
      await connection.value.stop();
      connection.value = null;
      return;
    } else {
      console.log("--> No connection to close");
    }
  };

  const handleVisibilityChange = () => {
    console.warn("--> Visibility changed", document?.visibilityState);
    if (!document) return;
    if (document.visibilityState === VisibilityStates.VISIBLE) {
      try {
        console.log(
          `--> APP Resumed, Connection: ${connection.value} State: ${connection.value?.state}`
        );
        connect();
      } catch (error) {
        console.error("--> APP Resume Error!");
      }
    }
  };

  // User Connections

  const _onUserConnectionDeleteEvent = () => {
    console.log("--> Connecting UserConnectionRemoved event");
    connection.value.on(
      SignalRHubMethods.ConnectionDeleted,
      chatStore.handleConnectionDelete
    );
  };

  const _offUserConnectionDeleteEvent = () => {
    console.log("--> Disconnecting UserConnectionRemoved event");
    connection.value.off(
      SignalRHubMethods.ConnectionDeleted,
      chatStore.handleConnectionDelete
    );
  };

  const _onUserConnectionUpdatedEvent = () => {
    console.log("--> Connecting UserConnectionUpdated event");
    connection.value.on(
      SignalRHubMethods.ConnectionUpdated,
      chatStore.handleConnectionUpdated
    );
  };

  const _offUserConnectionUpdatedEvent = () => {
    console.log("--> Disconnecting UserConnectionChange event");
    connection.value.off(
      SignalRHubMethods.ConnectionUpdated,
      chatStore.handleConnectionUpdated
    );
  };

  const _onConnectionRequestReceivedEvent = () => {
    console.log("--> Connecting ConnectionRequestReceived event");
    connection.value.on(
      SignalRHubMethods.ConnectionRequestReceived,
      chatStore.handleConnectionRequestReceived
    );
  };

  const _offConnectionRequestReceivedEvent = () => {
    console.log("--> Disconnecting ConnectionRequestReceived event");
    connection.value.off(
      SignalRHubMethods.ConnectionRequestReceived,
      chatStore.handleConnectionRequestReceived
    );
  };

  // Rooms

  const _onRoomUpdatedEvent = () => {
    console.log("--> Connecting RoomUpdated event");
    connection.value.on(
      SignalRHubMethods.RoomUpdated,
      chatStore.handleUpdateRoom
    );
  };

  const _offRoomUpdatedEvent = () => {
    console.log("--> Disconnecting RoomUpdated event");
    connection.value.off(
      SignalRHubMethods.RoomUpdated,
      chatStore.handleUpdateRoom
    );
  };

  const _onUserAddedToRoomEvent = () => {
    console.log("--> Connecting UserAddedToRoom event");
    connection.value.on(
      SignalRHubMethods.UserAddedToRoom,
      _handleUserAddedToRoomActions
    );
  };

  const _offUserAddedToRoomEvent = () => {
    console.log("--> Disconnecting UserAddedToRoom event");
    connection.value.off(
      SignalRHubMethods.UserAddedToRoom,
      _handleUserAddedToRoomActions
    );
  };

  const _onUserRemovedFromRoomEvent = () => {
    console.log("--> Connecting UserRemovedFromRoom event");
    connection.value.on(
      SignalRHubMethods.UserRemovedFromRoom,
      _handleUserRemovedFromRoomActions
    );
  };

  const _offUserRemovedFromRoomEvent = () => {
    console.log("--> Disconnecting UserRemovedFromRoom event");
    connection.value.off(
      SignalRHubMethods.UserRemovedFromRoom,
      _handleUserRemovedFromRoomActions
    );
  };

  const _onRoomDeletedEvent = () => {
    console.log("--> Connecting RoomDeleted event");
    connection.value.on(
      SignalRHubMethods.RoomDeleted,
      chatStore.handleDeleteRoom
    );
  };

  const _offRoomDeletedEvent = () => {
    console.log("--> Disconnecting RoomDeleted event");
    connection.value.off(
      SignalRHubMethods.RoomDeleted,
      chatStore.handleDeleteRoom
    );
  };

  const _connectToRooms = (roomIds: string[]) => {
    if (connection.value.state !== signalR.HubConnectionState.Connected) {
      console.warn("--> Cant connect to Rooms");
      return;
    }

    if (roomIds.length == 0) {
      console.log("--> No rooms to connect with");
      return;
    }

    console.log("--> Connecting to Rooms", roomIds);
    connection.value
      .invoke(SignalRHubMethods.ConnectToRooms, {
        RoomIds: roomIds,
      })
      .then((result) => {
        console.log("--> Connected to rooms", result);
      });
  };

  const _connectToRoom = (roomId: string) => {
    if (connection.value.state !== signalR.HubConnectionState.Connected) {
      console.warn("--> Cant connect to Rooms");
      return;
    }

    if (!roomId) {
      console.warn("--> Incorect Room Id");
      return;
    }

    console.log("--> Connecting to Room", roomId);
    connection.value
      .invoke(SignalRHubMethods.ConnectToRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("--> Connected to room", result);
      });
  };

  const _disconnectFromRoom = (roomId: string) => {
    if (connection.value.state !== signalR.HubConnectionState.Connected) {
      console.warn("--> Cant disconnect from Room");
      return;
    }

    if (!roomId) {
      console.warn("--> Incorect Room Id");
      return;
    }

    console.log("--> Disconnecting from Room", roomId);
    connection.value
      .invoke(SignalRHubMethods.DisconnectFromRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("--> Disconnected from room", result);
      });
  };

  const createRoom = (name: string) => {
    console.log("--> Connection state:", connection.value.state);
    console.log("--> Creating room:", name);
    connection.value
      .invoke(SignalRHubMethods.CreateRoom, { RoomName: name })
      .then((newRoom: IRoom) => {
        console.log("--> New room created", newRoom);
        const chatStore = useChatStore();
        chatStore.addRoom(newRoom);
        _connectToRoom(newRoom.id);
        appStore.showSuccessSnackbar("Room created");
      })
      .catch((err) => {
        // todo: make auth work or remove it
        if (err.message.indexOf("auth_expired") > 0) {
          console.log("--> Auth cookie expored");
          navigateTo("/user/login");
        } else {
          throw err;
        }
      });
  };

  // Room Handlers

  const _handleUserAddedToRoomActions = (data: IRoom) => {
    _connectToRoom(data.id);
    chatStore.handleUserAddedToRoom(data);
  };

  const _handleUserRemovedFromRoomActions = (options: IUserRoomOptions) => {
    console.warn("--> Handling UserRemovedFromRoom in SignalR", options);
    if (userData.getUsername.value === options.userName) {
      console.warn("--> Active user is being removed - signalR");
      _disconnectFromRoom(options.roomId);
      chatStore.handleUserRemovedFromRoom(options);
      return;
    }

    console.warn("--> Other user is being removed - signalR");
    chatStore.handleUserRemovedFromRoom(options);
  };

  // Messages

  const _onIncomingMessage = () => {
    console.log("--> Connecting SendMessage event");
    connection.value.on(
      SignalRHubMethods.MessageIncoming,
      chatStore.handleIncomingMessage
    );
  };

  const _offIncomingMessage = () => {
    console.log("--> Disconnecting SendMessage event");
    connection.value.off(
      SignalRHubMethods.MessageIncoming,
      chatStore.handleIncomingMessage
    );
  };

  const sendMessage = (message: string, roomId: string) => {
    console.log("--> Connection state:", connection.value.state);
    console.log("--> Sending message:", message);

    const newMessage: ISentMessage = {
      roomId: roomId,
      text: message,
    };

    connection.value.send(SignalRHubMethods.SendMessage, newMessage);
  };

  return {
    connectionState,
    isConnected,
    connectionPresent,
    closeConnection,
    createRoom,
    sendMessage,
    connect,
    handleVisibilityChange,
  };
};
