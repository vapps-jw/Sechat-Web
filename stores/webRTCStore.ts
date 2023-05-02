import { servers } from "~/utilities/globalEnums";

export const useWebRTCStore = defineStore({
  id: "webRTC-store",
  state: () => {
    return {
      // Sechat
      videoCallRequestSent: <boolean>false,
      videoCallEstablished: <boolean>false,
      videoCallWaitingForApproval: <boolean>false,
      videoCallViewVisible: <boolean>false,
      videoCallContact: <IContactRequest>null,
      // WebRTC
      localStream: <MediaStream>null,
      remoteStream: <MediaStream>null,
      peerConnection: <RTCPeerConnection>null,
    };
  },
  actions: {
    updateLocalStream(value: MediaStream) {},
    updateRemoteStream(value: MediaStream) {},
    createPeerConnection() {
      this.peerConnection = new RTCPeerConnection(servers);
    },
  },
  getters: {
    // Sechat
    getVideoCallEstablished: (state) => state.videoCallEstablished,
    getVideoCallViewVisible: (state) => state.videoCallViewVisible,
    getVideoCallRequestSent: (state) => state.videoCallRequestSent,
    getVideoCallWaitingForApproval: (state) =>
      state.videoCallWaitingForApproval,
    getVideoCallContact: (state) => state.videoCallContact,
    // WebRTC
    getPeerConnection: (state) => state.peerConnection,
    getLocalStream: (state) => state.peerConnection,
    getRemoteStream: (state) => state.peerConnection,
  },
});
