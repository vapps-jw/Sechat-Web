export const useChatApi = () => {
  const config = useRuntimeConfig();
  const chatStore = useChatStore();
  const processing = useState<boolean>(() => false);

  const getState = async () => {
    console.log("--> Getting State");
    processing.value = true;
    const { error: apiError, data: chatState } = await useFetch<IChatState>(
      `${config.public.apiBase}/chat/get-state`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (apiError.value) {
      processing.value = false;
      throw createError({
        ...apiError.value,
        statusMessage: "Failed to pull state",
        statusCode: apiError.value.statusCode,
      });
    }

    console.log("--> State Fetched", chatState.value);
    chatStore.loadRooms(chatState.value.rooms);
    chatStore.loadUserConnections(chatState.value.userConnections);
    processing.value = false;
  };

  return { processing, getState };
};
