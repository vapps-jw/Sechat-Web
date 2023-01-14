export const useAppStore = () => {
  const localLanguage = useState<string>(
    "localLanguage",
    () => useI18n().locale.value
  );

  return { localLanguage };
};
