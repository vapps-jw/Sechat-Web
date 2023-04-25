import * as signalR from "@microsoft/signalr";
import { IChannel, channelFactory } from "~/utilities/channels";
import { SignalRState } from "~~/utilities/globalEnums";

export const useSignalRStore = defineStore({
  id: "signalR-store",
  state: () => {
    return {
      videoCallInProgress: <boolean>false,
      connection: <signalR.HubConnection>null,
      videoCallChannel: <IChannel>channelFactory(),
    };
  },
  actions: {
    initiateVideoCallChannel() {
      this.videoCallChannel = channelFactory();
      this.videoCallInProgress = true;
    },
    terminateVideoCallChannel() {
      this.videoCallChannel = channelFactory();
      this.videoCallInProgress = false;
    },
    updateConnectionValue(value: signalR.HubConnection) {
      this.connection = value;
    },
    async closeConnection() {
      await this.connection.stop();
    },
  },
  getters: {
    videoCallChannel: (state) => state.videoCallChannel,
    videoCall: (state) => state.videoCallInProgress,
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
