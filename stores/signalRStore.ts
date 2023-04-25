import * as signalR from "@microsoft/signalr";
import { IChannel, channelFactory } from "~/utilities/channels";
import { SignalRState } from "~~/utilities/globalEnums";

export const useSignalRStore = defineStore({
  id: "signalR-store",
  state: () => {
    return {
      videoCallMediaSource: <MediaSource>null,
      videoCallDialog: <boolean>false,
      videoCallDialogContact: <IConnectionRequest>null,
      videoCallViewVisible: <boolean>false,
      videoCallSubject: <signalR.Subject<any>>null,
      videoCallContact: <IConnectionRequest>null,
      connection: <signalR.HubConnection>null,
      videoCallChannel: <IChannel>channelFactory(),
    };
  },
  actions: {
    resetMediaSource() {
      this.videoCallMediaSource = new MediaSource();
    },
    showVideoCallDialog(contact: IConnectionRequest) {
      this.videoCallDialog = true;
      this.videoCallDialogContact = contact;
    },
    hideVideoCallDialog(contact: IConnectionRequest) {
      this.videoCallDialog = false;
      this.videoCallDialogContact = null;
    },
    initializeVideoCall(contact: IConnectionRequest) {
      this.videoCallViewVisible = true;
      this.videoCallSubject = new signalR.Subject();
      this.videoCallContact = contact;
      this.videoCallChannel = channelFactory();
    },
    answerVideoCall(contact: IConnectionRequest) {
      this.videoCallViewVisible = true;
      this.videoCallSubject = new signalR.Subject();
      this.videoCallContact = contact;
      this.videoCallChannel = channelFactory();
    },
    terminateVideoCall() {
      this.videoCallViewVisible = false;
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
    getVideoCallMediaSource: (state) => state.videoCallMediaSource,
    isVideoCallDialogVisible: (state) => state.videoCallDialog,
    whoIsCalling: (state) => state.videoCallDialogContact,
    isVideoCallViewVisible: (state) => state.videoCallViewVisible,
    videoCallContactPresent: (state) => (state.videoCallContact ? true : false),
    getVideoCallContact: (state) => state.videoCallContact,
    getVideoCallChannel: (state) => state.videoCallChannel,
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
