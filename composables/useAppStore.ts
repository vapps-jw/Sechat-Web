import { SnackbarIcons } from "~~/utilities/globalEnums";

export const useAppStore = () => {
  const config = useRuntimeConfig();

  const loadingOverlayVisible = useState<boolean>(
    "loadingOverlayVisible",
    () => false
  );
  const pingServerInterval = useState<NodeJS.Timer>(
    "pingServerInterval",
    () => null
  );
  const localLanguage = useState<string>(
    "localLanguage",
    () => useI18n().locale.value
  );
  const snackbarData = useState<ISanckbar>("snackbarData", () => {
    return {
      snackbar: false,
      text: "",
      timeout: 2000,
      color: "",
      icon: "",
      iconColor: "",
    };
  });

  const startPing = () => {
    pingServerInterval.value = setInterval(
      async () => await pingServer(),
      2000
    );
  };

  const stopPing = () => {
    clearInterval(pingServerInterval.value);
  };

  const showLoadingOverlay = () => {
    loadingOverlayVisible.value = true;
  };
  const hideLoadingOverlay = () => {
    loadingOverlayVisible.value = false;
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
    snackbarData.value = data;
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
    localLanguage,
    snackbarData,
    loadingOverlayVisible,
    showSnackbar,
    showSuccessSnackbar,
    showWarningSnackbar,
    showErrorSnackbar,
    showInfoSnackbar,
    pingServer,
    showLoadingOverlay,
    hideLoadingOverlay,
    startPing,
    stopPing,
  };
};
