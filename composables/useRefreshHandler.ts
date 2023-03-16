export const useRefreshHandler = () => {
  const appStore = useAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();

  const handleVisibilityChange = async () => {
    appStore.showLoadingOverlay();

    signalR.handleVisibilityChange();
    chatApi.getState();

    appStore.hideLoadingOverlay();
  };

  const handleOnlineChange = async () => {
    appStore.showLoadingOverlay();

    chatApi.getState();

    appStore.hideLoadingOverlay();
  };

  const handleOfflineChange = async () => {
    appStore.showLoadingOverlay();

    signalR.handleOffline();

    appStore.hideLoadingOverlay();
  };

  return { handleVisibilityChange, handleOnlineChange, handleOfflineChange };
};
