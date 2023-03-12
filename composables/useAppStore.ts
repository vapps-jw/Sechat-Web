import { SnackbarIcons } from "~~/utilities/globalEnums";

export const useAppStore = () => {
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
    showSnackbar,
    showSuccessSnackbar,
    showWarningSnackbar,
    showErrorSnackbar,
    showInfoSnackbar,
  };
};
