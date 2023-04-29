export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();
  const signalRStore = useSignalRStore();

  const handleVisibilityChange = async () => {
    appStore.updateLoadingOverlay(true);

    //signalRStore.clearVideoCallData();

    const chatState = await chatApi.getState();
    chatStore.loadRooms(chatState.rooms);
    chatStore.loadConnections(chatState.userConnections);

    signalR.handleVisibilityChange();

    appStore.updateLoadingOverlay(false);
  };

  const handleOnlineChange = async () => {
    appStore.updateLoadingOverlay(false);
    appStore.updateOnlineState(true);

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
