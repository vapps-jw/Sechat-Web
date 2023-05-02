import { SnackbarIcons } from "~/utilities/globalEnums";

export const useSechatAppStore = defineStore({
  id: "sechat-app-store",
  state: () => {
    return {
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
    showLoadingOverlay: (state) => state.loadingOverlayVisible,
    getOnlineState: (state) => state.isOnline,
  },
});
