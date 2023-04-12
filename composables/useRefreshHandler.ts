export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const sechatApp = useSechatApp();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();

  const handleVisibilityChange = async () => {
    appStore.updateLoadingOverlay(true);

    chatStore.activateRoomsView();

    const chatState = await chatApi.getState();
    chatStore.loadRooms(chatState.rooms);
    chatStore.loadConnections(chatState.userConnections);

    signalR.handleVisibilityChange();

    appStore.updateLoadingOverlay(false);
  };

  const handleOnlineChange = async () => {
    appStore.updateLoadingOverlay(true);

    sechatApp.handleOnline();

    chatStore.activateRoomsView();

    const chatState = await chatApi.getState();
    chatStore.loadRooms(chatState.rooms);
    chatStore.loadConnections(chatState.userConnections);

    signalR.handleVisibilityChange();

    appStore.updateLoadingOverlay(false);
  };

  const handleOfflineChange = async () => {
    appStore.updateLoadingOverlay(true);

    sechatApp.handleOffline();

    appStore.updateLoadingOverlay(false);
  };

  return { handleVisibilityChange, handleOnlineChange, handleOfflineChange };
};
