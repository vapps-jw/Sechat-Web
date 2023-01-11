import * as signalR from "@microsoft/signalr";

const useSignalR = () => {
  let connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:5100")
    .build();
};

export default useSignalR;
