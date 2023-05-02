import { Servers } from "~/utilities/globalEnums";

export const useWebRTCStore = defineStore({
  id: "webRTC-store",
  state: () => {
    return {
      // Sechat
      targetPlayerVisible: <boolean>false,
      localPlayerVisible: <boolean>false,
      videoCallRequestSent: <boolean>false,
      videoCallEstablished: <boolean>false,
      videoCallWaitingForApproval: <boolean>false,
      videoCallViewVisible: <boolean>false,
      videoCallContact: <IContactRequest>null,
      // Media
      remoteVideo: <HTMLVideoElement>null,
      localVideo: <HTMLVideoElement>null,
      // WebRTC
      localStream: <MediaStream>null,
      remoteStream: <MediaStream>null,
      peerConnection: <RTCPeerConnection>null,
      iceCandidates: <IStringMessageForUser[]>[],
    };
  },
  actions: {
    // Media
    clearVideoSources() {
      if (this.remoteVideo) {
        this.remoteVideo.srcObject = null;
      }
      if (this.localVideo) {
        this.localVideo.srcObject = null;
      }
    },
    updateLocalStream(value: MediaStream) {
      this.localStream = value;
    },
    createRemoteStream() {
      this.remoteStream = new MediaStream();
    },
    updateRemoteVideoPlayer(value: HTMLVideoElement) {
      this.remoteVideo = value;
    },
    addRemoteStreamToPlayer() {
      this.remoteVideo.srcObject = this.remoteStream;
    },
    updateLocalVideoPlayer(value: HTMLVideoElement) {
      this.localVideo = value;
    },
    addLocalStreamToPlayer() {
      this.localVideo.srcObject = this.localStream;
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
    addIceCandidate(value: IStringMessageForUser) {
      this.iceCandidates.push(value);
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
    getSourcePlayerVisible: (state) => state.localPlayerVisible,
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
  },
});
