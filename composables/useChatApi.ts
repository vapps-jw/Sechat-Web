export const useChatApi = () => {
  const config = useRuntimeConfig();
  const chatStore = useChatStore();

  const getRooms = async () => {
    console.log("--> Getting Rooms");
    const { error: apiError, data: rooms } = await useFetch<IRoom[]>(
      `${config.public.apiBase}/chat/get-my-rooms`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusMessage: "Failed to pull rooms",
        statusCode: apiError.value.statusCode,
      });
    }

    console.log("--> Rooms Fetched", rooms.value);
    chatStore.loadRooms(rooms.value);
  };

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

    console.log("--> Rooms Fetched", chatState.value);
    chatStore.loadRooms(chatState.value.rooms);
  };

  return { getRooms, getState };
};
