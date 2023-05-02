import { Servers } from "~/utilities/globalEnums";

export const useWebRTCStore = defineStore({
  id: "webRTC-store",
  state: () => {
    return {
      // Sechat
      targetPlayerVisible: <boolean>false,
      sourcePlayerVisible: <boolean>false,
      videoCallRequestSent: <boolean>false,
      videoCallEstablished: <boolean>false,
      videoCallWaitingForApproval: <boolean>false,
      videoCallViewVisible: <boolean>false,
      videoCallContact: <IContactRequest>null,
      // Media
      videoTarget: <HTMLVideoElement>null,
      videoSource: <HTMLVideoElement>null,
      // WebRTC
      localStream: <MediaStream>null,
      remoteStream: <MediaStream>null,
      peerConnection: <RTCPeerConnection>null,
    };
  },
  actions: {
    // Media
    clearVideoSources() {
      if (this.videoTarget) {
        this.videoTarget.src = "";
      }
      if (this.videoSource) {
        this.videoSource.src = "";
      }
    },
    updateLocalStream(value: MediaStream) {
      this.localStream = value;
    },
    updateRemoteStream(value: MediaStream) {
      this.remoteStream = value;
    },
    updateVideoTarget(value: HTMLVideoElement) {
      this.videoTarget = value;
    },
    updateVideoSource(value: HTMLVideoElement) {
      this.videoSource = value;
    },
    addLocalStreamToPlayer() {
      this.videoSource.srcObject = this.localStream;
    },
    addTargetStreamToPlayer() {
      this.videoTarget.srcObject = this.remoteStream;
    },
    // Sechat
    updateTargetPlayerVisible(value: boolean) {
      this.targetPlayerVisible = value;
    },
    updateSourcePlayerVisible(value: boolean) {
      this.sourcePlayerVisible = value;
    },
    updateVideoCallRequestSent(value: boolean) {
      this.videoCallRequestSent = value;
    },
    updateVideoCallViewVisible(value: boolean) {
      this.videoCallViewVisible = value;
    },
    updateVideoCallWaitingForApproval(value: boolean) {
      this.videoCallWaitingForApproval = value;
    },
    updateVideoCallEstablished(value: boolean) {
      this.videoCallEstablished = value;
    },
    updateVideoCallContact(data: IContactRequest) {
      this.videoCallContact = data;
    },
    // WebRTC
    createPeerConnection() {
      this.peerConnection = new RTCPeerConnection(Servers);
    },
    cleanup() {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }
    },
  },
  getters: {
    // Sechat
    getTargetPlayerVisible: (state) => state.targetPlayerVisible,
    getSourcePlayerVisible: (state) => state.sourcePlayerVisible,
    getVideoCallEstablished: (state) => state.videoCallEstablished,
    getVideoCallViewVisible: (state) => state.videoCallViewVisible,
    getVideoCallRequestSent: (state) => state.videoCallRequestSent,
    getVideoCallWaitingForApproval: (state) =>
      state.videoCallWaitingForApproval,
    getVideoCallContact: (state) => state.videoCallContact,
    getVideoCallContactName: (state) => state.videoCallContact?.displayName,
    // WebRTC
    getPeerConnection: (state) => state.peerConnection,
    // Media
    getLocalAudioTrack: (state) =>
      state.localStream?.getTracks().find((track) => track.kind === "audio"),
    getLocalVideoTrack: (state) =>
      state.localStream?.getTracks().find((track) => track.kind === "video"),
    getVideoTarget: (state) => state.videoTarget,
    getVideoSource: (state) => state.videoSource,
    getLocalStream: (state) => state.peerConnection,
    getRemoteStream: (state) => state.peerConnection,
  },
});
