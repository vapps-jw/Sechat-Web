import * as signalR from "@microsoft/signalr";

export const useSignalR = () => {
  const config = useRuntimeConfig();
  const chatStore = useChatStore();
  const userData = useUserData();

  const SignalRState = {
    Connected: "Connected",
    Disconnected: "Disconnected",
    Connecting: "Connecting",
  };

  const SignalRHubMethods = {
    SendMessage: "SendMessage",
    ConnectToRooms: "ConnectToRooms",
    ConnectToRoom: "ConnectToRoom",
    CreateRoom: "CreateRoom",
    MessageIncoming: "MessageIncoming",
    RoomDeleted: "RoomDeleted",
    ConnectionRequestReceived: "ConnectionRequestReceived",
    ConnectionDeleted: "ConnectionDeleted",
    ConnectionChanged: "ConnectionChanged",
  };

  const createNewConnection = () => {
    return new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.apiBase}/chat-hub`)
      .withAutomaticReconnect()
      .build();
  };

  const connection = useState<signalR.HubConnection>("signalRConnection", () =>
    createNewConnection()
  );

  const openConnection = async () => {
    if (connection.value === null) {
      connection.value = createNewConnection();
    }

    if (connection.value.state !== SignalRState.Connected) {
      connection.value = createNewConnection();
      connection.value.onclose(() => {
        _offIncomingMessage();
        _offRoomDeletedEvent();
        _offConnectionRequestReceivedEvent();
        _offUserConnectionChangeEvent();
        _offUserConnectionDeleteEvent();
        console.log("--> Connection Closed");
      });

      await connection.value.start();

      if (connection.value.state === SignalRState.Connected) {
        console.log("--> Connection established");
        _connectToRooms(chatStore.getRooms.value.map((r) => r.id));
        _onIncomingMessage();
        _onRoomDeletedEvent();
        _onConnectionRequestReceivedEvent();
        _onUserConnectionChangeEvent();
        _onUserConnectionDeleteEvent();
        return;
      }

      throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
    }
    console.log("--> Already Connected");
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

  const _onUserConnectionChangeEvent = () => {
    console.log("--> Connecting UserConnectionChange event");
    connection.value.on(
      SignalRHubMethods.ConnectionChanged,
      chatStore.handleUserConnectionChange
    );
  };

  const _offUserConnectionChangeEvent = () => {
    console.log("--> Disconnecting UserConnectionChange event");
    connection.value.off(
      SignalRHubMethods.ConnectionChanged,
      chatStore.handleUserConnectionChange
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
    if (connection.value.state !== SignalRState.Connected) {
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
    if (connection.value.state !== SignalRState.Connected) {
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
    openConnection,
    createRoom,
    sendMessage,
  };
};
