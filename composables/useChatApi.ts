export const useChatApi = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();

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

      chatState.value.userConnections.forEach((uc) => {
        if (uc.invitedName === userStore.userProfile.userName) {
          uc.displayName = uc.inviterName;
        } else {
          uc.displayName = uc.invitedName;
        }
      });

      return chatState.value;
    } catch (error) {}
  };

  const markMessagesAsViewed = async (): Promise<IChatState> => {
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

      chatState.value.userConnections.forEach((uc) => {
        if (uc.invitedName === userStore.userProfile.userName) {
          uc.displayName = uc.inviterName;
        } else {
          uc.displayName = uc.invitedName;
        }
      });

      return chatState.value;
    } catch (error) {}
  };

  const sendMessage = async (message: string, roomId: string) => {
    console.log("--> Sending message:", message);

    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/send-message`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          Text: message,
          RoomId: roomId,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusMessage: "Failed to send message",
        statusCode: apiError.value.statusCode,
      });
    }
  };

  const leaveRoom = async (room: IRoom) => {
    console.warn("--> API Leave Room", room);

    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/leave-room`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          RoomId: room.id,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusMessage: "Failed to leave room",
        statusCode: apiError.value.statusCode,
      });
    }
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

  return { getState, inviteToRoom, leaveRoom, sendMessage };
};
