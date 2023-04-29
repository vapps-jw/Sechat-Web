export const useSechatAppStore = defineStore({
  id: "sechat-app-store",
  state: () => {
    return {
      videoTarget: <HTMLVideoElement>null,
      videoSource: <HTMLVideoElement>null,
      loadingOverlayVisible: <boolean>false,
      pingServerInterval: <NodeJS.Timer>null,
      localLanguage: <string>useI18n().locale.value,
      snackbarData: <ISanckbar>{
        snackbar: false,
        text: "",
        timeout: 2000,
        color: "",
        icon: "",
        iconColor: "",
      },
      isOnline: <boolean>true,
    };
  },
  actions: {
    updateVideoTarget(value: HTMLVideoElement) {
      this.videoTarget = value;
    },
    updateVideoSource(value: HTMLVideoElement) {
      this.videoSource = value;
    },
    updateLoadingOverlay(value: boolean) {
      this.loadingOverlayVisible = value;
    },
    updateSnackbar(value: ISanckbar) {
      this.snackbarData = value;
    },
    updateOnlineState(value: boolean) {
      this.isOnline = value;
    },
  },
  getters: {
    getVideoTarget: (state) => state.videoTarget,
    getVideoSource: (state) => state.videoSource,
    showLoadingOverlay: (state) => state.loadingOverlayVisible,
    getOnlineState: (state) => state.isOnline,
  },
});
