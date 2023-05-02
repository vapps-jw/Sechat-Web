export const useWebRTCStore = defineStore({
  id: "webRTC-store",
  state: () => {
    return {
      videoCallRequestSent: <boolean>false,
      videoCallEstablished: <boolean>false,
      videoCallWaitingForApproval: <boolean>false,
      videoCallViewVisible: <boolean>false,
      videoCallContact: <IContactRequest>null,
    };
  },
  actions: {
    updateVideoCallRequestSent(value: boolean) {},
  },
  getters: {
    getVideoCallRequestSent: (state) => state.videoCallRequestSent,
    getVideoCallViewVisible: (state) => state.videoCallViewVisible,
  },
});
