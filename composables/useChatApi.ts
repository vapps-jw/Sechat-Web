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

  return { getRooms };
};
