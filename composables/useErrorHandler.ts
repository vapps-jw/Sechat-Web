export const useErrorHandler = () => {
  const appStore = useSechatAppStore();

  const handleApiError = async (error: any) => {
    if (Object.hasOwn(error, "value")) {
      console.error("Handled Error", error.value?.data);
    }
  };

  return {
    handleApiError,
  };
};
