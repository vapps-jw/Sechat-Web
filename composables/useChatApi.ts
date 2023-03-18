export const useChatApi = () => {
  const config = useRuntimeConfig();

  const getState = async (): Promise<IChatState> => {
    console.log("--> Getting State from API");
    try {
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
      return chatState.value;
    } catch (error) {}
  };

  const inviteToRoom = async (
    chosenConnection: IConnectionRequest,
    roomId: string
  ) => {
    console.warn("--> API Inviting User", chosenConnection);

    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/add-to-room`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          userName: chosenConnection.displayName,
          RoomId: roomId,
          ConnectionId: chosenConnection.id,
        },
      }
    );

    if (apiError.value) {
      const displayError = createError({
        ...apiError.value,
        statusMessage: "Sign in Failed",
        statusCode: apiError.value.statusCode,
      });
      console.log("--> Throwing Error", displayError);
      throw displayError;
    }
  };

  return { getState, inviteToRoom };
};
