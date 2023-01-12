import * as signalR from "@microsoft/signalr";

const useSignalR = () => {
  const config = useRuntimeConfig();
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${config.public.apiBase}/chat-hub`)
    .build();

  const openConnection = () => {
    connection.start().then(() => {
      console.log("connected");
      connection.send("LogConnection", { message: "we've connected" });
    });
  };

  return { openConnection };
};

export default useSignalR;
