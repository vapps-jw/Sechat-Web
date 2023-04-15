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
  },
  getters: {
    showLoadingOverlay: (state) => state.loadingOverlayVisible,
    getOnlineState: (state) => state.isOnline,
  },
});
