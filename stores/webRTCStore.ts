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
      micOn: <boolean>true,
      camOn: <boolean>true,
      // WebRTC
      callNotificationInterval: <NodeJS.Timer>null,
      readyToReceiveCandidates: <boolean>false,
      remoteIceCandidatesBuffer: <RTCIceCandidate[]>[],
      localStream: <MediaStream>null,
      remoteStream: <MediaStream>null,
      peerConnection: <RTCPeerConnection>null,
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
      this.localVideo.muted = true;
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
    stopCalling() {
      clearInterval(this.callNotificationInterval);
      this.callNotificationInterval = null;
    },
    updatePeerConnection(peerConnection: RTCPeerConnection) {
      this.peerConnection = peerConnection;
    },
    cleanup() {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }
      clearInterval(this.callNotificationInterval);
      this.callNotificationInterval = null;
    },
  },
  getters: {
    // Sechat
    getVideoCallContact: (state) => state.videoCallContact,
    getVideoCallContactName: (state) => state.videoCallContact?.displayName,
    // WebRTC
    getPeerConnectionState: (state) => state.peerConnection?.connectionState,
    getPeerConnection: (state) => state.peerConnection,
    // Media
    getLocalAudioTrack: (state) =>
      state.localStream?.getTracks().find((track) => track.kind === "audio"),
    getLocalVideoTrack: (state) =>
      state.localStream?.getTracks().find((track) => track.kind === "video"),
  },
});
