import * as signalR from "@microsoft/signalr";
import { HubConnectionState } from "@microsoft/signalr";

export const useSignalRStore = defineStore({
  id: "signalR-store",
  state: () => {
    return {
      connection: <signalR.HubConnection>null,
      connectionState: <string>HubConnectionState.Disconnected,
    };
  },
  actions: {
    updateConnectionValue(value: signalR.HubConnection) {
      this.connection = value;
    },
    updateConnectionState() {
      if (!this.connection) {
        this.connectionState = HubConnectionState.Disconnected;
        return;
      }
      this.connectionState = this.connection.state;
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
    connectionPresent: (state) => {
      if (state.connection) {
        return true;
      }
      return false;
    },
  },
});
