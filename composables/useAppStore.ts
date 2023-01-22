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

  return { localLanguage, snackbarData, showSnackbar };
};
