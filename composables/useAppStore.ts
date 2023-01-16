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
    };
  });

  const showSnackbar = (data: ISanckbar) => {
    snackbarData.value = data;
  };

  return { localLanguage, snackbarData, showSnackbar };
};
