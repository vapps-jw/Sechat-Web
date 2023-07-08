import { SnackbarIcons } from "~/utilities/globalEnums";

export const useChatApi = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const sechatApp = useSechatApp();

  const getLinkPreview = async (link: string) => {
    console.log("--> Getting Link Preview from API");
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
    console.log("--> Getting Contacts from API");
    const { error: apiError, data: contacts } = await useFetch<
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

    console.log("--> Contacts Fetched", contacts.value);

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
    console.log("--> Getting Rooms from API");
    const { error: apiError, data: rooms } = await useFetch<IRoom[]>(
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

    console.log("--> Rooms Fetched", rooms.value);
    rooms.value.forEach((r) => (r.hasKey = false));
    return rooms.value;
  };

  const getRoom = async (roomId: string) => {
    console.log("--> Getting Rooms from API");
    const { error: apiError, data: room } = await useFetch<IRoom>(
      `${config.public.apiBase}/chat/room/${roomId}`,
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

    console.log("--> Room Fetched", room.value);
    return room.value;
  };

  const getRoomsUpdate = async (
    updateRequests: IRoomUpdateRequest[]
  ): Promise<IRoom[]> => {
    console.log("--> Getting Rooms Updates from API", updateRequests);
    const { error: apiError, data: rooms } = await useFetch<IRoom[]>(
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

    console.log("--> Rooms Updates Fetched", rooms.value);
    rooms.value.forEach((r) => (r.hasKey = false));
    return rooms.value;
  };

  const getContactsUpdate = async (
    updateRequests: IContactUpdateRequest[]
  ): Promise<IContactRequest[]> => {
    console.log("--> Getting Contact Updates from API", updateRequests);
    const { error: apiError, data: rooms } = await useFetch<IContactRequest[]>(
      `${config.public.apiBase}/chat/contacts-update`,
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

    console.log("--> Contacts Updates Fetched", rooms.value);
    rooms.value.forEach((c) => (c.hasKey = false));
    return rooms.value;
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

  const markDirectMessageAsViewed = async (
    contactId: number,
    messageId: number
  ) => {
    console.log("--> Marking Single Direct Message as viewed");
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

  const markDirectMessagesAsViewed = async (contactId: number) => {
    console.log("--> Marking Direct Messages as viewed");
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

  const decryptMessage = async (
    id: number,
    message: string,
    roomId: string
  ) => {
    console.log("--> Decrypting message");
    const { error: apiError, data: messageData } =
      await useFetch<IMessageDecryptionRequest>(
        `${config.public.apiBase}/crypto/decrypt-message`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          credentials: "include",
          body: {
            id: id,
            message: message,
            roomId: roomId,
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

    return messageData.value;
  };

  const decryptDirectMessage = async (
    id: number,
    message: string,
    contactId: number
  ) => {
    console.log("--> Decrypting message");
    const { error: apiError, data: messageData } =
      await useFetch<IDirectMessageDecryptionRequest>(
        `${config.public.apiBase}/crypto/decrypt-direct-message`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          credentials: "include",
          body: {
            id: id,
            message: message,
            contactId: contactId,
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

    return messageData.value;
  };

  return {
    getContactsUpdate,
    markDirectMessageAsViewed,
    markDirectMessagesAsViewed,
    decryptDirectMessage,
    getRoom,
    decryptMessage,
    getLinkPreview,
    getConstacts,
    getRooms,
    getRoomsUpdate,
    markMessageAsViewed,
    markMessagesAsViewed,
  };
};
