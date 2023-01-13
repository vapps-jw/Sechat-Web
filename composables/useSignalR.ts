import * as signalR from "@microsoft/signalr";

export const useSignalR = () => {
  const config = useRuntimeConfig();
  const chatStore = useChatStore();
  const chatApi = useChatApi();

  // const connection = useState("signalRConnection", () => {
  //   return [];
  // });

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${config.public.apiBase}/chat-hub`)
    .build();

  const openConnection = () => {
    console.log("--> Opening connection, state:", connection.state);
    if (connection.state === "Disconnected") {
      connection.start().then(() => {
        console.log("--> Connection Started");
        connection.send("LogConnection", { message: "we're connected" });
        console.log("--> Connection state:", connection.state);
      });
    }
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
