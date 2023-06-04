import { getInitials, stringToColor } from "~/utilities/stringFunctions";
import { SnackbarIcons } from "~~/utilities/globalEnums";

export const useChatApi = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const sechatApp = useSechatApp();

  const getState = async (): Promise<IChatState> => {
    console.log("--> Getting State from API");
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

    chatState.value.rooms.forEach((r) =>
      r.messages.forEach((m) => {
        m.colorSentBy = stringToColor(m.nameSentBy);
        m.initialsSentBy = getInitials(m.nameSentBy);
      })
    );

    chatState.value.userContacts.forEach((uc) => {
      if (uc.invitedName === userStore.userProfile.userName) {
        uc.displayName = uc.inviterName;
      } else {
        uc.displayName = uc.invitedName;
      }

      uc.initials = getInitials(uc.displayName);
      uc.color = stringToColor(uc.displayName);
    });

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
    getState,
    markMessageAsViewed,
    markMessagesAsViewed,
  };
};
