import { getInitials, stringToColor } from "~/utilities/stringFunctions";
import { SnackbarIcons } from "~~/utilities/globalEnums";

export const useChatApi = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const sechatApp = useSechatApp();

  const getConstacts = async (): Promise<IContactRequest[]> => {
    console.log("--> Getting Contacts from API");
    const { error: apiError, data: chatState } = await useFetch<
      IContactRequest[]
    >(`${config.public.apiBase}/chat/contacts`, {
      method: "GET",
      credentials: "include",
    });

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    console.log("--> Contacts Fetched", chatState.value);

    chatState.value.forEach((uc) => {
      if (uc.invitedName === userStore.userProfile.userName) {
        uc.displayName = uc.inviterName;
      } else {
        uc.displayName = uc.invitedName;
      }
    });

    return chatState.value;
  };

  const getRooms = async (): Promise<IRoom[]> => {
    console.log("--> Getting Rooms from API");
    const { error: apiError, data: chatState } = await useFetch<IRoom[]>(
      `${config.public.apiBase}/chat/rooms`,
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

    console.log("--> Rooms Fetched", chatState.value);

    return chatState.value;
  };

  const getRoomsUpdate = async (
    updateRequests: IRoomUpdateRequest[]
  ): Promise<IRoom[]> => {
    console.log("--> Getting Rooms Updates from API", updateRequests);
    const { error: apiError, data: chatState } = await useFetch<IRoom[]>(
      `${config.public.apiBase}/chat/rooms-update`,
      {
        method: "POST",
        credentials: "include",
        body: updateRequests,
      }
    );

    if (apiError.value) {
      console.error(apiError.value);
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    console.log("--> Rooms Updates Fetched", chatState.value);

    return chatState.value;
  };

  const markMessagesAsViewed = async (roomId: string) => {
    console.log("--> Marking Messages as viewed");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/messages-viewed`,
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

  const markMessageAsViewed = async (roomId: string, messageId: number) => {
    console.log("--> Marking Single Message as viewed");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/message-viewed/${roomId}/${messageId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        credentials: "include",
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

  return {
    getConstacts,
    getRooms,
    getRoomsUpdate,
    markMessageAsViewed,
    markMessagesAsViewed,
  };
};
