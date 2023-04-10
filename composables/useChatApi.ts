import { SnackbarIcons } from "~~/utilities/globalEnums";

export const useChatApi = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const sechatApp = useSechatApp();

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
          statusCode: apiError.value.statusCode,
          statusMessage: apiError.value.data,
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

  const markMessagesAsViewed = async (roomId: string) => {
    console.log("--> Marking messages as viewed");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/message-viewed`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        credentials: "include",
        body: { Id: roomId },
        onResponseError({ response }) {
          if (response.status === 400) {
            sechatApp.showSnackbar({
              snackbar: true,
              text: response._data,
              timeout: 2000,
              color: "warning",
              icon: SnackbarIcons.Warning,
              iconColor: "black",
            });
          } else {
            sechatApp.showSnackbar({
              snackbar: true,
              text: "Connection Error",
              timeout: 2000,
              color: "error",
              icon: SnackbarIcons.Error,
              iconColor: "black",
            });

            throw createError({
              ...apiError.value,
              statusMessage: response._data,
            });
          }
        },
      }
    );
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
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
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
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
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
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }
  };

  return {
    getState,
    inviteToRoom,
    leaveRoom,
    sendMessage,
    markMessagesAsViewed,
  };
};
