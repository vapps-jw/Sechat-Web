import { SnackbarIcons } from "~/utilities/globalEnums";

export const useChatApi = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const sechatStore = useSechatAppStore();

  const getLinkPreview = async (link: string) => {
    console.log("Getting Link Preview from API");
    const { error: apiError, data: preview } = await useFetch<ILinkPreview>(
      `${config.public.apiBase}/linkPreview`,
      {
        method: "POST",
        credentials: "include",
        body: { url: link },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    return preview.value;
  };

  const getConstacts = async (): Promise<IContactRequest[]> => {
    console.log("Getting Contacts from API");
    const { error: apiError, data: contacts } = await useFetch<
      IContactRequest[]
    >(`${config.public.apiBase}/chat/contacts-initial-load`, {
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

    console.log("Contacts Fetched", contacts.value);

    contacts.value.forEach((uc) => {
      if (uc.invitedName === userStore.userProfile.userName) {
        uc.displayName = uc.inviterName;
      } else {
        uc.displayName = uc.invitedName;
      }
    });

    return contacts.value;
  };

  const getRooms = async (): Promise<IRoom[]> => {
    console.log("Getting Rooms from API");
    const { error: apiError, data: rooms } = await useFetch<IRoom[]>(
      `${config.public.apiBase}/chat/rooms-initial-load`,
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

    console.log("Rooms Fetched", rooms.value);
    return rooms.value;
  };

  const getRoom = async (id: string): Promise<IRoom> => {
    console.log("Getting Rooms from API");
    const { error: apiError, data: room } = await useFetch<IRoom>(
      `${config.public.apiBase}/chat/room-initial-load/${id}`,
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

    console.log("Rooms Fetched", room.value);
    return room.value;
  };

  const getContact = async (contactId: number) => {
    console.log("Getting Cotnact from API");
    const { error: apiError, data: uc } = await useFetch<IContactRequest>(
      `${config.public.apiBase}/chat/contact/${contactId}`,
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

    if (uc.value.invitedName === userStore.userProfile.userName) {
      uc.value.displayName = uc.value.inviterName;
    } else {
      uc.value.displayName = uc.value.invitedName;
    }

    console.log("Contact Fetched", uc.value);
    return uc.value;
  };

  const markMessagesAsViewed = async (roomId: string) => {
    console.log("Marking Messages as viewed");
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
            sechatStore.showSnackbar({
              snackbar: true,
              text: response._data,
              timeout: 2000,
              color: "warning",
              icon: SnackbarIcons.Warning,
              iconColor: "black",
            });
          } else {
            sechatStore.showSnackbar({
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
    console.log("Marking Single Message as viewed");
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
            sechatStore.showSnackbar({
              snackbar: true,
              text: response._data,
              timeout: 2000,
              color: "warning",
              icon: SnackbarIcons.Warning,
              iconColor: "black",
            });
          } else {
            sechatStore.showSnackbar({
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

  const markDirectMessageAsViewed = async (
    contactId: number,
    messageId: number
  ) => {
    console.log("Marking Single Direct Message as viewed");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/direct-message-viewed/${contactId}/${messageId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        credentials: "include",
        onResponseError({ response }) {
          if (response.status === 400) {
            sechatStore.showSnackbar({
              snackbar: true,
              text: response._data,
              timeout: 2000,
              color: "warning",
              icon: SnackbarIcons.Warning,
              iconColor: "black",
            });
          } else {
            sechatStore.showSnackbar({
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

  const markDirectMessagesAsViewed = async (contactId: number) => {
    console.log("Marking Direct Messages as viewed");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/chat/direct-messages-viewed`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        credentials: "include",
        body: { Id: contactId },
        onResponseError({ response }) {
          if (response.status === 400) {
            sechatStore.showSnackbar({
              snackbar: true,
              text: response._data,
              timeout: 2000,
              color: "warning",
              icon: SnackbarIcons.Warning,
              iconColor: "black",
            });
          } else {
            sechatStore.showSnackbar({
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

  const clearChat = async (contactId: number) => {
    const { error: apiError, data: resData } = await useFetch(
      `${config.public.apiBase}/chat/direct-messages/${contactId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
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
  };

  return {
    getRoom,
    clearChat,
    getContact,
    markDirectMessageAsViewed,
    markDirectMessagesAsViewed,
    getLinkPreview,
    getConstacts,
    getRooms,
    markMessageAsViewed,
    markMessagesAsViewed,
  };
};
