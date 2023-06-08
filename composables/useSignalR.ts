import * as signalR from "@microsoft/signalr";
import { SignalRHubMethods, VisibilityStates } from "~~/utilities/globalEnums";

export const useSignalR = () => {
  const sechatStore = useSechatAppStore();
  const sechatApp = useSechatApp();
  const config = useRuntimeConfig();
  const sechatChat = useSechatChat();
  const sechatChatStore = useSechatChatStore();
  const userStore = useUserStore();
  const signalRStore = useSignalRStore();
  const videoCalls = useVideoCall();

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
    videoCalls.onVideoCallApprovedEvent(connection);
    videoCalls.onVideoCallRejectedEvent(connection);
    videoCalls.onVideoCallRequestedEvent(connection);
    videoCalls.onVideoCallTerminatedEvent(connection);
    videoCalls.onICECandidateIncomingEvent(connection);
    videoCalls.onWebRTCOfferIncomingEvent(connection);
    videoCalls.onWebRTCAnswerIncomingEvent(connection);
    sechatChat.onContactStateChangedEvent(connection);
    sechatChat.onMessageWasViewed(connection);
    sechatChat.onMessagesWereViewed(connection);
    sechatChat.onIncomingMessage(connection);
    sechatChat.onRoomDeletedEvent(connection);
    sechatChat.onRoomUpdatedEvent(connection);
    sechatChat.onConnectionRequestReceivedEvent(connection);
    sechatChat.onUserConnectionUpdatedEvent(connection);
    sechatChat.onUserConnectionDeleteEvent(connection);
    _onUserAddedToRoomEvent(connection);
    _onUserRemovedFromRoomEvent(connection);

    // Disconnect from events on connection close
    connection.onclose(async () => {
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
      console.warn("--> Connection Closed - connection.onclose");
    });

    connection.onreconnected(async (connectionId) => {
      try {
        sechatStore.updateLoadingOverlay(true);

        // Get the updates
        console.log("--> Reconnected, getting state ...", connectionId);
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
            statusCode: apiError.value.statusCode,
            statusMessage: apiError.value.data,
          });
        }

        sechatChat.loadRooms(chatState.value.rooms);
        sechatChat.loadUserConnections(chatState.value.userContacts);

        console.log("--> Reconnected, connectiong to Rooms ...");
        _connectToRooms(sechatChatStore.availableRooms.map((r) => r.id));
      } catch (error) {
        console.error("--> Fetch State Failed", error);
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
    if (
      signalRStore.connection &&
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.log("--> Starting Current Connection, connecting to Rooms");
      await signalRStore.connection.start();
      _connectToRooms(sechatChatStore.availableRooms.map((r) => r.id));
    }
    if (!signalRStore.connection) {
      await createNewConnection();
    }
  };

  const closeConnection = async () => {
    if (signalRStore.getConnection) {
      console.log("--> Closing connection, calling stop method");
      await signalRStore.closeConnection();
    } else {
      console.log("--> No connection to close");
    }
  };

  // Rooms

  const _onUserAddedToRoomEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting UserAddedToRoom event");
    connection.on(
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

  const createRoom = (data: IRoomCreateRequest) => {
    console.log("--> Connection state:", signalRStore.connection.state);
    console.log("--> SignalR Creating Room:", data);
    signalRStore.connection
      .invoke(SignalRHubMethods.CreateRoom, {
        RoomName: data.roomName,
        UserEncrypted: data.userEncrypted,
      })
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

  return {
    closeConnection,
    createRoom,
    connect,
  };
};
