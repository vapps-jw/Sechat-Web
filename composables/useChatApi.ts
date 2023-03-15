export const useChatApi = () => {
  const config = useRuntimeConfig();
  const chatStore = useChatStore();
  const appStore = useAppStore();

  const getState = async () => {
    console.log("--> Getting State");
    try {
      appStore.showLoadingOverlay();
      const { error: apiError, data: chatState } = await useFetch<IChatState>(
        `${config.public.apiBase}/chat/get-state`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (apiError.value) {
        throw createError({
          ...apiError.value,
          statusMessage: "Failed to pull state",
          statusCode: apiError.value.statusCode,
        });
      }

      console.log("--> State Fetched", chatState.value);
      chatStore.loadRooms(chatState.value.rooms);
      chatStore.loadUserConnections(chatState.value.userConnections);
    } catch (error) {
    } finally {
      appStore.hideLoadingOverlay();
    }
  };

  const handleOffline = () => {
    console.warn("--> Became offline");
    appStore.showInfoSnackbar("You are offline!");
  };

  const handleOnline = async () => {
    console.warn("--> Became online");
    appStore.showInfoSnackbar("You are back online!");
    await getState();
  };

  return { getState, handleOffline, handleOnline };
};
