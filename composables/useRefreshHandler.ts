export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const sechatApp = useSechatApp();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useChatStore();

  const handleVisibilityChange = async () => {
    appStore.updateLoadingOverlay(true);

    signalR.handleVisibilityChange();

    const chatState = await chatApi.getState();

    chatStore.loadRooms(chatState.rooms);
    chatStore.loadUserConnections(chatState.userConnections);

    appStore.updateLoadingOverlay(false);
  };

  const handleOnlineChange = async () => {
    appStore.updateLoadingOverlay(true);
    // todo: add signalR reconnect
    sechatApp.handleOnline();

    const chatState = await chatApi.getState();

    chatStore.loadRooms(chatState.rooms);
    chatStore.loadUserConnections(chatState.userConnections);

    appStore.updateLoadingOverlay(true);
  };

  const handleOfflineChange = async () => {
    appStore.updateLoadingOverlay(true);

    sechatApp.handleOffline();

    appStore.updateLoadingOverlay(false);
  };

  return { handleVisibilityChange, handleOnlineChange, handleOfflineChange };
};
