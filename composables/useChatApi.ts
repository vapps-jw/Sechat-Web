export const useChatApi = () => {
  const config = useRuntimeConfig();
  const chatStore = useChatStore();

  const getState = async () => {
    console.log("--> Getting State");
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
  };

  return { getState };
};
