export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
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
    appStore.updateLoadingOverlay(false);
    appStore.updateOnlineState(true);

    chatStore.activateRoomsView();

    const chatState = await chatApi.getState();
    chatStore.loadRooms(chatState.rooms);
    chatStore.loadConnections(chatState.userConnections);

    signalR.handleVisibilityChange();
  };

  const handleOfflineChange = async () => {
    appStore.updateOnlineState(false);
    appStore.updateLoadingOverlay(true);
  };

  return { handleVisibilityChange, handleOnlineChange, handleOfflineChange };
};
