import * as signalR from "@microsoft/signalr";
import { HubConnectionState } from "@microsoft/signalr";

export const useSignalRForGrames = () => {
  const config = useRuntimeConfig();
  const signalRGamesStore = useSignalRGamesStore();

  const createNewConnection = async () => {
    signalRGamesStore.updateConnectionStateWithValue(
      HubConnectionState.Connecting
    );

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.apiBase}/chat-hub`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          signalRGamesStore.updateConnectionState();
          console.warn(
            "Reconnecting SignalR",
            signalRGamesStore.connection.state,
            signalRGamesStore.connectionState
          );
          return 1000;
        },
      })
      .build();

    // On Example

    // connection.on(
    //   SignalRHubMethods.VideoCallApproved,
    //   videoCalls.videoCallApproved
    // );

    // Disconnect from events on connection close
    connection.onclose(async () => {
      //connection.off(SignalRHubMethods.VideoCallApproved);

      console.warn("Connection Closed - connection.onclose");
    });

    connection.onreconnected(async (connectionId) => {
      try {
        signalRGamesStore.updateConnectionState();
        //appStore.updateLoadingOverlayWithMessage(true, "Synchronizing...");
        console.warn("SIGNALR RECONNECTED", connectionId);
        await reconnectedActionsLazy();
      } catch (error) {
        console.error("SIGNALR RECONNECTION ERROR", error);
      } finally {
        signalRGamesStore.updateConnectionState();
      }
    });

    connection.onclose((error) => {
      signalRGamesStore.updateConnectionState();
      console.warn("SignalR Connection Closed", error);
    });

    console.log("Starting Connection ...");
    await connection.start();
    signalRGamesStore.updateConnectionValue(connection);
    signalRGamesStore.updateConnectionState();
  };

  const reconnectedActionsLazy = async () => {
    console.warn("RECONNECTED ACTIONS - LAZY");
  };

  const connect = async () => {
    signalRGamesStore.updateConnectionState();
    if (
      signalRGamesStore.connection &&
      signalRGamesStore.connection.state ===
        signalR.HubConnectionState.Connected
    ) {
      console.log("Already Connected");
    }
    if (
      signalRGamesStore.connection &&
      signalRGamesStore.connection.state ===
        signalR.HubConnectionState.Disconnected
    ) {
      console.log("Starting Current Connection");
      await signalRGamesStore.connection.start();
      signalRGamesStore.updateConnectionState();
      return;
    }
    if (!signalRGamesStore.connection) {
      console.log("Starting New Connection");
      await createNewConnection();
      signalRGamesStore.updateConnectionState();
    }
  };

  return {
    connect,
  };
};
