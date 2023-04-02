export const useSignalRStore = defineStore({
  id: "signalR-store",
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
  },
  getters: {},
});
