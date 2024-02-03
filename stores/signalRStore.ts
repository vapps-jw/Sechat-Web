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
    updateConnectionStateWithValue(value: HubConnectionState) {
      this.connectionState = value;
    },
    async closeConnection() {
      if (this.connection) {
        await this.connection.stop();
      }
    },
  },
  getters: {
    showConnectionBanner: (state) => {
      return (
        !state.connection ||
        (state.connection &&
          state.connectionState !== HubConnectionState.Connected)
      );
    },
    getConnection: (state) => state.connection,
    connectionPresent: (state) => {
      if (state.connection) {
        return true;
      }
      return false;
    },
  },
});
