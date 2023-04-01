export const useRefreshHandler = () => {
  const appStore = useAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useChatStore();

  const handleVisibilityChange = async () => {
    appStore.showLoadingOverlay();

    signalR.handleVisibilityChange();

    const chatState = await chatApi.getState();

    chatStore.loadRooms(chatState.rooms);
    chatStore.loadUserConnections(chatState.userConnections);

    appStore.hideLoadingOverlay();
  };

  const handleOnlineChange = async () => {
    appStore.showLoadingOverlay();
    // todo: add signalR reconnect
    appStore.handleOnline();

    const chatState = await chatApi.getState();

    chatStore.loadRooms(chatState.rooms);
    chatStore.loadUserConnections(chatState.userConnections);

    appStore.hideLoadingOverlay();
  };

  const handleOfflineChange = async () => {
    appStore.showLoadingOverlay();

    appStore.handleOffline();

    appStore.hideLoadingOverlay();
  };

  return { handleVisibilityChange, handleOnlineChange, handleOfflineChange };
};
