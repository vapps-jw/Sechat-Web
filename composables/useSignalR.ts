import * as signalR from "@microsoft/signalr";

export const useSignalR = () => {
  const config = useRuntimeConfig();
  const chatStore = useChatStore();
  const chatApi = useChatApi();

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${config.public.apiBase}/chat-hub`)
    .build();

  const handleIncomingMessage = (message: IMessage) => {
    console.log("--> Incoming Message", message);
  };

  const openConnection = () => {
    console.log("--> Opening connection, state:", connection.state);
    if (connection.state === "Disconnected") {
      connection.start().then(() => {
        console.log("--> Connection Started");
        connection.send("LogConnection", { message: "we're connected" });
        console.log("--> Connection state:", connection.state);
      });
      return;
    }
    console.log("--> Already Connected");
  };

  const startListeningForMessages = () => {
    console.log("--> Connection state:", connection.state);
    if (connection.state === "Disconnected") {
      console.log("--> Cant lisen for messages");
      return;
    }

    connection.on("send_message", handleIncomingMessage);
  };

  const stopListeningForMessages = () => {
    console.log("--> Connection state:", connection.state);
    if (connection.state === "Disconnected") {
      console.log("--> Cant lisen for messages");
      return;
    }

    connection.off("send_message", handleIncomingMessage);
  };

  const connectToRooms = () => {
    console.log("--> Connection state:", connection.state);
    if (connection.state === "Disconnected") {
      console.log("--> Cant connect to Rooms");
      return;
    }

    if (chatStore.rooms.value?.length == 0) {
      console.log("--> No rooms to connect with");
      return;
    }

    console.log("--> Connecting to Rooms", chatStore.rooms.value?.length);
    connection
      .invoke("ConnectToRooms", {
        RoomIds: chatStore.rooms.value.map((r) => r.id),
      })
      .then((result) => {
        console.log("--> Connected to rooms", result);
      });
  };

  const createRoom = (name: string) => {
    console.log("--> Connection state:", connection.state);
    console.log("--> Creating room", name);
    connection.invoke("CreateRoom", { RoomName: name }).then((newRoom) => {
      console.log("--> New room created", newRoom);
      const chatStore = useChatStore();
      chatStore.addRoom(newRoom);
    });
  };

  return { openConnection, createRoom };
};
