import * as signalR from "@microsoft/signalr";

export const useSignalR = () => {
  const config = useRuntimeConfig();
  const chatStore = useChatStore();
  const userData = useUserData();

  const SignalRState = {
    Connected: "Connected",
    Disconnected: "Disconnected",
  };

  const SignalRHubMethods = {
    SendMessage: "MessageIncoming",
    ConnectToRooms: "ConnectToRooms",
    CreateRoom: "CreateRoom",
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

  const closeConnection = () => {
    if (connection.value === null) {
      console.log("--> There is no connection");
      return;
    }

    if (connection.value.state === SignalRState.Connected) {
      setTimeout(() => {
        connection.value.stop().then(function () {
          console.log("--> Connection is closing");
          connection.value = null;
        });
      }, 100);
    }
  };

  const handleIncomingMessage = (message: IMessage) => {
    console.log("--> Incoming Message", message);
  };

  const openConnection = () => {
    if (connection.value === null) {
      connection.value = createNewConnection();
    }

    if (connection.value.state !== SignalRState.Connected) {
      connection.value = createNewConnection();
      connection.value.onclose(async () => {
        await console.log("--> Connection Closed");
      });
      connection.value.start().then(() => {
        console.log("--> Connection Started");
        connection.value.send("LogConnection", { message: "we're connected" });
        console.log("--> Connection state:", connection.value.state);
      });
      return;
    }
    console.log("--> Already Connected");
  };

  const startListeningForMessages = () => {
    if (connection.value.state === SignalRState.Disconnected) {
      console.log("--> Cant listen for messages", connection.value.state);
      return;
    }

    connection.value.on(SignalRHubMethods.SendMessage, handleIncomingMessage);
  };

  const stopListeningForMessages = () => {
    console.log("--> Connection state:", connection.value.state);
    if (connection.value.state === SignalRState.Disconnected) {
      console.log("--> Cant listen for messages");
      return;
    }

    connection.value.off(SignalRHubMethods.SendMessage, handleIncomingMessage);
  };

  const connectToRooms = () => {
    console.log("--> Connection state:", connection.value.state);
    if (connection.value.state === SignalRState.Disconnected) {
      console.log("--> Cant connect to Rooms");
      return;
    }

    if (chatStore.rooms.value?.length == 0) {
      console.log("--> No rooms to connect with");
      return;
    }

    console.log("--> Connecting to Rooms", chatStore.rooms.value?.length);
    connection.value
      .invoke(SignalRHubMethods.ConnectToRooms, {
        RoomIds: chatStore.rooms.value.map((r) => r.id),
      })
      .then((result) => {
        console.log("--> Connected to rooms", result);
      });
  };

  const createRoom = (name: string) => {
    console.log("--> Connection state:", connection.value.state);
    console.log("--> Creating room:", name);
    connection.value
      .invoke(SignalRHubMethods.CreateRoom, { RoomName: name })
      .then((newRoom) => {
        console.log("--> New room created", newRoom);
        const chatStore = useChatStore();
        chatStore.addRoom(newRoom);
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

  const sendMessage = (message: string) => {
    console.log("--> Connection state:", connection.value.state);
    console.log("--> Sending message:", message);

    let randomId = Math.floor(Math.random() * 999999);
    const newMessage: IMessage = {
      id: randomId,
      idSentBy: userData.userData.value.userId,
      nameSentBy: "test-user",
      created: new Date(),
      text: message,
    };

    chatStore.activeRoom.value.messages.push(newMessage);

    //connection.value.send("");

    //connection.send('SendMessage', {message, room: currentRoom})

    // message DTO
    // public string SenderId { get; set; } = string.Empty;
    // public string Text { get; set; } = string.Empty;
    // public string RoomId { get; set; } = string.Empty;
  };

  return {
    openConnection,
    createRoom,
    closeConnection,
    startListeningForMessages,
    stopListeningForMessages,
    sendMessage,
  };
};
