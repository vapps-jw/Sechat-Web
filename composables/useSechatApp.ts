import { SnackbarIcons } from "~~/utilities/globalEnums";

export const useSechatApp = () => {
  const config = useRuntimeConfig();
  const useAppStore = useSechatAppStore();

  const startPing = () => {
    useAppStore.pingServerInterval = setInterval(
      async () => await pingServer(),
      2000
    );
  };

  const stopPing = () => {
    clearInterval(useAppStore.pingServerInterval);
  };

  const handleOffline = () => {
    console.warn("--> Handling Offline from SignalR");
    useAppStore.isOnline = false;
  };

  const handleOnline = async () => {
    console.warn("--> Handling Online from SignalR");
    useAppStore.isOnline = true;
  };

  const showLoadingOverlay = () => {
    useAppStore.updateLoadingOverlay(true);
  };
  const hideLoadingOverlay = () => {
    useAppStore.updateLoadingOverlay(false);
  };

  const pingServer = async () => {
    console.log("--> Ping Server");
    await useFetch(`${config.public.apiBase}/status/ping-api`, {
      method: "GET",
      onResponse({ response }) {
        console.log("--> Ping Result", response.status);
      },
      onResponseError({ response }) {
        console.log("--> Ping Result", response.status);
      },
    });
  };

  const showSnackbar = (data: ISanckbar) => {
    console.log("--> Snackbar data", data);
    useAppStore.updateSnackbar(data);
  };

  const showSuccessSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 2000,
      color: "success",
      icon: SnackbarIcons.Success,
      iconColor: "black",
    });
  };

  const showInfoSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 2000,
      color: "primary",
      icon: SnackbarIcons.Info,
      iconColor: "white",
    });
  };

  const showWarningSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 2000,
      color: "warning",
      icon: SnackbarIcons.Warning,
      iconColor: "black",
    });
  };

  const showOfflineSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 2000,
      color: "error",
      icon: SnackbarIcons.Offline,
      iconColor: "black",
    });
  };

  const showDisconnectedSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 2000,
      color: "error",
      icon: SnackbarIcons.Disconnected,
      iconColor: "black",
    });
  };

  const showErrorSnackbar = (message: string) => {
    showSnackbar({
      snackbar: true,
      text: message,
      timeout: 2000,
      color: "error",
      icon: SnackbarIcons.Error,
      iconColor: "black",
    });
  };

  return {
    showSnackbar,
    showSuccessSnackbar,
    showWarningSnackbar,
    showErrorSnackbar,
    showInfoSnackbar,
    showOfflineSnackbar,
    showDisconnectedSnackbar,
    pingServer,
    showLoadingOverlay,
    hideLoadingOverlay,
    startPing,
    stopPing,
    handleOffline,
    handleOnline,
  };
};