import * as signalR from "@microsoft/signalr";
import { SignalRState } from "~~/utilities/globalEnums";

export const useSignalRStore = defineStore({
  id: "signalR-store",
  state: () => {
    return {
      connection: <signalR.HubConnection>null,
    };
  },
  actions: {
    updateConnectionValue(value: signalR.HubConnection) {
      this.connection = value;
    },
    async closeConnection() {
      if (this.connection) {
        await this.connection.stop();
      }
    },
  },
  getters: {
    getConnection: (state) => state.connection,
    isConnected: (state) => {
      if (
        state.connection &&
        state.connection.state === signalR.HubConnectionState.Connected
      ) {
        return true;
      }
      return false;
    },
    connectionState: (state) => {
      if (!state.connection) {
        return SignalRState.Disconnected;
      }
      if (state.connection.state === signalR.HubConnectionState.Connected) {
        return SignalRState.Connected;
      }
      if (
        state.connection.state === signalR.HubConnectionState.Connecting ||
        state.connection.state === signalR.HubConnectionState.Reconnecting
      ) {
        return SignalRState.Connecting;
      }
      return SignalRState.Disconnected;
    },
    connectionPresent: (state) => {
      if (state.connection) {
        return true;
      }
      return false;
    },
  },
});
