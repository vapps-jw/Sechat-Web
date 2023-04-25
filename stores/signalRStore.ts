import * as signalR from "@microsoft/signalr";
import { IChannel, channelFactory } from "~/utilities/channels";
import { SignalRState, VideoCallStatus } from "~~/utilities/globalEnums";

export const useSignalRStore = defineStore({
  id: "signalR-store",
  state: () => {
    return {
      videoCallSubject: <signalR.Subject<any>>null,
      videoCallContact: <IConnectionRequest>null,
      videoCallStatus: <string>VideoCallStatus.None,
      connection: <signalR.HubConnection>null,
      videoCallChannel: <IChannel>channelFactory(),
    };
  },
  actions: {
    initializeVideoCall(contact: IConnectionRequest) {
      this.videoCallStatus = VideoCallStatus.Initialized;
      this.videoCallSubject = new signalR.Subject();
      this.videoCallContact = contact;
      this.videoCallChannel = channelFactory();
    },
    answerVideoCall(contact: IConnectionRequest) {
      this.videoCallStatus = VideoCallStatus.Answered;
      this.videoCallSubject = new signalR.Subject();
      this.videoCallContact = contact;
      this.videoCallChannel = channelFactory();
    },
    terminateVideoCall() {
      this.videoCallStatus = VideoCallStatus.None;
      this.videoCallSubject = null;
      this.videoCallContact = null;
      this.videoCallChannel = channelFactory();
    },
    updateVideoCallContact(data: IConnectionRequest) {
      this.videoCallContact = data;
    },
    clearVideoCallContact() {
      this.videoCallContact = null;
    },
    updateConnectionValue(value: signalR.HubConnection) {
      this.connection = value;
    },
    async closeConnection() {
      await this.connection.stop();
    },
  },
  getters: {
    getVideoCallContact: (state) => state.videoCallContact,
    getVideoCallChannel: (state) => state.videoCallChannel,
    getVideoCallStatus: (state) => state.videoCallStatus,
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
