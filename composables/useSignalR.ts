import * as signalR from "@microsoft/signalr";
import { scrollToBottom } from "~~/utilities/documentFunctions";
import { VisibilityStates, SignalRState } from "~~/utilities/globalEnums";

export const useSignalR = () => {
  const sechatStore = useSechatAppStore();
  const sechatApp = useSechatApp();
  const config = useRuntimeConfig();
  const sechatChat = useSechatChat();
  const sechatChatStore = useSechatChatStore();
  const userStore = useUserStore();
  const signalRStore = useSignalRStore();

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

  const createNewConnection = async () => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.apiBase}/chat-hub`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          console.log("--> Reconnecting ...");
          sechatStore.updateLoadingOverlay(true);
          return 1000;
        },
      })
      .build();

    // Connect to events on connection build
    _onIncomingMessage(connection);
    _onRoomDeletedEvent(connection);
    _onUserAddedToRoomEvent(connection);
    _onRoomUpdatedEvent(connection);
    _onUserRemovedFromRoomEvent(connection);
    _onConnectionRequestReceivedEvent(connection);
    _onUserConnectionUpdatedEvent(connection);
    _onUserConnectionDeleteEvent(connection);

    // Disconnect from events on connection close
    connection.onclose(async () => {
      _offIncomingMessage(connection);
      _offRoomDeletedEvent(connection);
      _offUserAddedToRoomEvent(connection);
      _offRoomUpdatedEvent(connection);
      _offUserRemovedFromRoomEvent(connection);
      _offConnectionRequestReceivedEvent(connection);
      _offUserConnectionUpdatedEvent(connection);
      _offUserConnectionDeleteEvent(connection);
      console.warn("--> Connection Closed - connection.onclose");
    });

    connection.onreconnected(async (connectionId) => {
      try {
        sechatStore.updateLoadingOverlay(true);

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

        sechatChat.loadRooms(chatState.value.rooms);
        sechatChat.loadUserConnections(chatState.value.userConnections);

        console.log("--> Reconnected, connectiong to Rooms ...");
        _connectToRooms(sechatChatStore.availableRooms.map((r) => r.id));

        if (sechatChatStore.activeRoomId) {
          scrollToBottom("chatView");
        }
      } catch (error) {
      } finally {
        sechatStore.updateLoadingOverlay(false);
      }
    });

    console.log("--> Starting Connection ...");
    await connection.start();

    signalRStore.updateConnectionValue(connection);
    if (
      signalRStore.connection.state === signalR.HubConnectionState.Connected
    ) {
      console.log("--> Connection Established, connectiong to Rooms ...");
      _connectToRooms(sechatChatStore.availableRooms.map((r) => r.id));
      return;
    }
  };

  const connect = async () => {
    if (
      signalRStore.connection &&
      signalRStore.connection.state === signalR.HubConnectionState.Connected
    ) {
      console.log("--> Already Connected");
    }
    if (!signalRStore.connection) {
      await createNewConnection();
    }
    if (
      signalRStore.connection &&
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.log("--> Starting Current Connection");
      await signalRStore.connection.start();
    }
    console.log("--> Starting Current Connection, connecting to Rooms");
    _connectToRooms(sechatChatStore.availableRooms.map((r) => r.id));
  };

  const closeConnection = async () => {
    if (signalRStore.getConnection) {
      console.log("--> Closing connection, calling stop method");
      await signalRStore.closeConnection();
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
          `--> APP Resumed, Connection: ${signalRStore.connection} State: ${signalRStore.connection?.state}`
        );
        connect();
      } catch (error) {
        console.error("--> APP Resume Error!");
      }
    }
  };

  // User Connections

  const _onUserConnectionDeleteEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting UserConnectionRemoved event");
    connection.on(
      SignalRHubMethods.ConnectionDeleted,
      sechatChat.handleConnectionDelete
    );
  };

  const _offUserConnectionDeleteEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting UserConnectionRemoved event");
    connection.off(
      SignalRHubMethods.ConnectionDeleted,
      sechatChat.handleConnectionDelete
    );
  };

  const _onUserConnectionUpdatedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting UserConnectionUpdated event");
    connection.on(
      SignalRHubMethods.ConnectionUpdated,
      sechatChat.handleConnectionUpdated
    );
  };

  const _offUserConnectionUpdatedEvent = (
    connection: signalR.HubConnection
  ) => {
    console.log("--> Disconnecting UserConnectionChange event");
    connection.off(
      SignalRHubMethods.ConnectionUpdated,
      sechatChat.handleConnectionUpdated
    );
  };

  const _onConnectionRequestReceivedEvent = (
    connection: signalR.HubConnection
  ) => {
    console.log("--> Connecting ConnectionRequestReceived event");
    connection.on(
      SignalRHubMethods.ConnectionRequestReceived,
      sechatChat.handleConnectionRequestReceived
    );
  };

  const _offConnectionRequestReceivedEvent = (
    connection: signalR.HubConnection
  ) => {
    console.log("--> Disconnecting ConnectionRequestReceived event");
    connection.off(
      SignalRHubMethods.ConnectionRequestReceived,
      sechatChat.handleConnectionRequestReceived
    );
  };

  // Rooms

  const _onRoomUpdatedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting RoomUpdated event");
    connection.on(SignalRHubMethods.RoomUpdated, sechatChat.handleUpdateRoom);
  };

  const _offRoomUpdatedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting RoomUpdated event");
    connection.off(SignalRHubMethods.RoomUpdated, sechatChat.handleUpdateRoom);
  };

  const _onUserAddedToRoomEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting UserAddedToRoom event");
    connection.on(
      SignalRHubMethods.UserAddedToRoom,
      _handleUserAddedToRoomActions
    );
  };

  const _offUserAddedToRoomEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting UserAddedToRoom event");
    connection.off(
      SignalRHubMethods.UserAddedToRoom,
      _handleUserAddedToRoomActions
    );
  };

  const _onUserRemovedFromRoomEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting UserRemovedFromRoom event");
    connection.on(
      SignalRHubMethods.UserRemovedFromRoom,
      _handleUserRemovedFromRoomActions
    );
  };

  const _offUserRemovedFromRoomEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting UserRemovedFromRoom event");
    connection.off(
      SignalRHubMethods.UserRemovedFromRoom,
      _handleUserRemovedFromRoomActions
    );
  };

  const _onRoomDeletedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting RoomDeleted event");
    connection.on(SignalRHubMethods.RoomDeleted, sechatChat.handleDeleteRoom);
  };

  const _offRoomDeletedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting RoomDeleted event");
    connection.off(SignalRHubMethods.RoomDeleted, sechatChat.handleDeleteRoom);
  };

  const _connectToRooms = (roomIds: string[]) => {
    if (
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("--> Cant connect to Rooms");
      return;
    }

    if (roomIds.length == 0) {
      console.log("--> No rooms to connect with");
      return;
    }

    console.log("--> Connecting to Rooms", roomIds);
    signalRStore.connection
      .invoke(SignalRHubMethods.ConnectToRooms, {
        RoomIds: roomIds,
      })
      .then((result) => {
        console.log("--> Connected to rooms", result);
      });
  };

  const _connectToRoom = (roomId: string) => {
    if (
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("--> Cant connect to Rooms");
      return;
    }

    if (!roomId) {
      console.warn("--> Incorect Room Id");
      return;
    }

    console.log("--> Connecting to Room", roomId);
    signalRStore.connection
      .invoke(SignalRHubMethods.ConnectToRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("--> Connected to room", result);
      });
  };

  const _disconnectFromRoom = (roomId: string) => {
    if (
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("--> Cant disconnect from Room");
      return;
    }

    if (!roomId) {
      console.warn("--> Incorect Room Id");
      return;
    }

    console.log("--> Disconnecting from Room", roomId);
    signalRStore.connection
      .invoke(SignalRHubMethods.DisconnectFromRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("--> Disconnected from room", result);
      });
  };

  const createRoom = (name: string) => {
    console.log("--> Connection state:", signalRStore.connection.state);
    console.log("--> SignalR Creating Room:", name);
    signalRStore.connection
      .invoke(SignalRHubMethods.CreateRoom, { RoomName: name })
      .then((newRoom: IRoom) => {
        console.log("--> New room created", newRoom);
        sechatChatStore.addRoom(newRoom);
        _connectToRoom(newRoom.id);
        sechatApp.showSuccessSnackbar("Room created");
      })
      .catch((err) => {
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
    sechatChat.handleUserAddedToRoom(data);
  };

  const _handleUserRemovedFromRoomActions = (options: IUserRoomOptions) => {
    console.warn("--> Handling UserRemovedFromRoom in SignalR", options);
    if (userStore.getUserName === options.userName) {
      console.warn("--> Active user is being removed - signalR");
      _disconnectFromRoom(options.roomId);
      sechatChat.handleUserRemovedFromRoom(options);
      return;
    }

    console.warn("--> Other user is being removed - signalR");
    sechatChat.handleUserRemovedFromRoom(options);
  };

  // Messages

  const _onIncomingMessage = (connection: signalR.HubConnection) => {
    console.log("--> Connecting SendMessage event");
    connection.on(
      SignalRHubMethods.MessageIncoming,
      sechatChat.handleIncomingMessage
    );
  };

  const _offIncomingMessage = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting IncomingMessage event");
    connection.off(
      SignalRHubMethods.MessageIncoming,
      sechatChat.handleIncomingMessage
    );
  };

  const sendMessage = (message: string, roomId: string) => {
    console.log("--> Connection state:", signalRStore.connection.state);
    console.log("--> Sending message:", message);

    const newMessage: ISentMessage = {
      roomId: roomId,
      text: message,
    };

    signalRStore.connection.send(SignalRHubMethods.SendMessage, newMessage);
  };

  return {
    closeConnection,
    createRoom,
    sendMessage,
    connect,
    handleVisibilityChange,
  };
};
