import * as signalR from "@microsoft/signalr";
import { IChannel, channelFactory } from "~/utilities/channels";
import { SignalRState, VideoCodecs } from "~~/utilities/globalEnums";

export const useSignalRStore = defineStore({
  id: "signalR-store",
  state: () => {
    return {
      videoCallPartBuffer: <string[]>[],
      videoCallLastIndex: <number>-1,
      videoCallDataRequestInterval: <NodeJS.Timer>null,
      videoCallStream: <MediaStream>null,
      videoCallMediaRecorder: <MediaRecorder>null,
      videoCallInProgress: <boolean>false,
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
    resetVideoCallPartBuffer() {
      this.videoCallPartBuffer = [];
      this.videoCallLastIndex = -1;
    },
    updateVideoCallDataRequestInterval(value: NodeJS.Timer) {
      this.videoCallDataRequestInterval = value;
    },
    updateVideoCallInProgress(value: boolean) {
      this.videoCallInProgress = value;
    },
    clearVideoCallData() {
      console.log("--> Clearing call data");
      if (this.videoCallSubject) {
        this.videoCallSubject.complete();
      }

      if (this.videoCallDataRequestInterval) {
        clearInterval(this.videoCallDataRequestInterval);
      }
      this.videoCallDataRequestInterval = null;

      if (this.videoCallStream) {
        this.videoCallStream.getTracks().forEach((track) => track.stop());
      }
      this.videoCallStream = null;
      if (this.videoCallMediaRecorder) {
        this.videoCallMediaRecorder.stop();
      }
      this.videoCallMediaRecorder = null;

      this.videoCallInProgress = false;
      this.videoCallMediaSource = null;
      this.videoCallSubject = null;
      this.videoCallDialog = false;
      this.videoCallViewVisible = false;
      this.videoCallContact = null;

      console.log("--> Clearing channel");
      this.videoCallPartBuffer = [];
      this.videoCallLastIndex = -1;

      this.videoCallChannel.clear();
      this.videoCallChannel = channelFactory();
    },
    resetMediaRecorder(stream: MediaStream) {
      this.videoCallMediaRecorder = new MediaRecorder(stream, {
        mimeType: VideoCodecs.webm9MimeCodec,
      });
    },
    updateVideoCallStream(stream: MediaStream) {
      this.videoCallStream = stream;
    },
    resetMediaSource() {
      this.videoCallMediaSource = new MediaSource();
    },
    resetVideoCallSignalRSubject() {
      this.videoCallSubject = new signalR.Subject();
    },
    showVideoCallDialog(contact: IConnectionRequest) {
      if (this.videoCallDialog && this.videoCallDialogContact === contact) {
        return;
      }
      this.videoCallDialog = true;
      this.videoCallDialogContact = contact;
    },
    hideVideoCallDialog(contact: IConnectionRequest) {
      this.videoCallDialog = false;
      this.videoCallDialogContact = null;
    },
    initializeVideoCall(contact: IConnectionRequest) {
      this.videoCallViewVisible = true;
      this.videoCallContact = contact;
      this.videoCallChannel = channelFactory();
    },
    answerVideoCall(contact: IConnectionRequest) {
      this.videoCallViewVisible = true;
      this.videoCallContact = contact;
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
    getVideoCallMediaRecorder: (state) => state.videoCallMediaRecorder,
    getVideoCallInProgress: (state) => state.videoCallInProgress,
    getVideoCallSubject: (state) => state.videoCallSubject,
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
