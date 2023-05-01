import { SnackbarIcons } from "~/utilities/globalEnums";

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
    clearVideoSources() {
      if (this.videoTarget) {
        this.videoTarget.src = "";
      }
      if (this.videoSource) {
        this.videoSource.src = "";
      }
    },
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
    showSnackbar(data: ISanckbar) {
      console.log("--> Snackbar data", data);
      this.updateSnackbar(data);
    },
    showSuccessSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 2000,
        color: "success",
        icon: SnackbarIcons.Success,
        iconColor: "black",
      });
    },
    showInfoSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 2000,
        color: "primary",
        icon: SnackbarIcons.Info,
        iconColor: "white",
      });
    },
    showWarningSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 2000,
        color: "warning",
        icon: SnackbarIcons.Warning,
        iconColor: "black",
      });
    },
    showOfflineSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 2000,
        color: "error",
        icon: SnackbarIcons.Offline,
        iconColor: "black",
      });
    },
    showDisconnectedSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 2000,
        color: "error",
        icon: SnackbarIcons.Disconnected,
        iconColor: "black",
      });
    },
    showErrorSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 2000,
        color: "error",
        icon: SnackbarIcons.Error,
        iconColor: "black",
      });
    },
  },
  getters: {
    getVideoTarget: (state) => state.videoTarget,
    getVideoSource: (state) => state.videoSource,
    showLoadingOverlay: (state) => state.loadingOverlayVisible,
    getOnlineState: (state) => state.isOnline,
  },
});
