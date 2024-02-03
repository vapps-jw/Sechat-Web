import { SnackbarIcons } from "~/utilities/globalEnums";

export const useSechatAppStore = defineStore({
  id: "sechat-app-store",
  state: () => {
    return {
      loadingOverlayVisible: <boolean>false,
      loadingOverlayMessage: <string>"",
      localLanguage: <string>null,
      snackbarData: <ISanckbar>{
        snackbar: false,
        text: "",
        timeout: 1500,
        color: "",
        icon: "",
        iconColor: "",
      },
      isOnline: <boolean>true,
      GDPR: <boolean>false,
    };
  },
  actions: {
    updateLocalLanguage(value: string) {
      this.localLanguage = value;
    },
    updateLoadingOverlay(value: boolean) {
      this.loadingOverlayVisible = value;
      if (!value) {
        this.loadingOverlayMessage = "";
      }
    },
    updateLoadingOverlayWithMessage(value: boolean, message: string) {
      this.loadingOverlayVisible = value;
      if (value) {
        this.loadingOverlayMessage = message;
      }
    },
    updateSnackbar(value: ISanckbar) {
      this.snackbarData = value;
    },
    updateOnlineState(value: boolean) {
      this.isOnline = value;
    },
    showSnackbar(data: ISanckbar) {
      console.log("Snackbar data", data);
      this.updateSnackbar(data);
    },
    showSuccessSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 1500,
        color: "success",
        icon: SnackbarIcons.Success,
        iconColor: "black",
      });
    },
    showInfoSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 1500,
        color: "primary",
        icon: SnackbarIcons.Info,
        iconColor: "white",
      });
    },
    showWarningSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 1500,
        color: "warning",
        icon: SnackbarIcons.Warning,
        iconColor: "black",
      });
    },
    showOfflineSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 1500,
        color: "error",
        icon: SnackbarIcons.Offline,
        iconColor: "black",
      });
    },
    showDisconnectedSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 1500,
        color: "error",
        icon: SnackbarIcons.Disconnected,
        iconColor: "black",
      });
    },
    showErrorSnackbar(message: string) {
      this.updateSnackbar(<ISanckbar>{
        snackbar: true,
        text: message,
        timeout: 1500,
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
