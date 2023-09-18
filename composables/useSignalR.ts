import * as signalR from "@microsoft/signalr";
import { HubConnectionState } from "@microsoft/signalr";
import {
  ChatViews,
  LocalStoreTypes,
  SignalRHubMethods,
} from "~~/utilities/globalEnums";

export const useSignalR = () => {
  const appStore = useSechatAppStore();
  const config = useRuntimeConfig();
  const chatStore = useSechatChatStore();
  const userStore = useUserStore();
  const signalRStore = useSignalRStore();
  const videoCalls = useVideoCall();
  const e2e = useE2Encryption();
  const e2eHandlers = useE2EHandlers();
  const contactHandlers = useContactHandlers();
  const dmHandlers = useDMHandlers();
  const roomHandlers = useRoomHandlers();
  const chatApi = useChatApi();

  const createNewConnection = async () => {
    signalRStore.updateConnectionStateWithValue(HubConnectionState.Connecting);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.apiBase}/chat-hub`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          signalRStore.updateConnectionState();
          console.warn(
            "Reconnecting SignalR",
            signalRStore.connection.state,
            signalRStore.connectionState
          );
          return 1000;
        },
      })
      .build();

    // Calls

    connection.on(
      SignalRHubMethods.VideoCallApproved,
      videoCalls.videoCallApproved
    );
    connection.on(
      SignalRHubMethods.VideoCallRejected,
      videoCalls.videoCallRejected
    );
    connection.on(
      SignalRHubMethods.VideoCallRequested,
      videoCalls.videoCallRequestReceived
    );
    connection.on(
      SignalRHubMethods.VideoCallTerminated,
      videoCalls.videoCallTerminated
    );
    connection.on(
      SignalRHubMethods.ICECandidateIncoming,
      videoCalls.ICECandidateIncoming
    );
    connection.on(
      SignalRHubMethods.WebRTCOfferIncoming,
      videoCalls.offerIncoming
    );
    connection.on(
      SignalRHubMethods.WebRTCAnswerIncoming,
      videoCalls.answerIncoming
    );
    connection.on(
      SignalRHubMethods.ScreenShareStateChanged,
      videoCalls.screenShareToggledByOtherUser
    );

    // Rooms

    connection.on(
      SignalRHubMethods.MessageWasViewed,
      roomHandlers.onMessageWasViewed
    );
    connection.on(
      SignalRHubMethods.MessagesWereViewed,
      roomHandlers.onMessagesWereViewed
    );
    connection.on(
      SignalRHubMethods.MessageIncoming,
      roomHandlers.onIncomingMessage
    );
    connection.on(
      SignalRHubMethods.RoomDeleted,
      roomHandlers.onRoomDeletedEvent
    );
    connection.on(
      SignalRHubMethods.RoomUpdated,
      roomHandlers.onRoomUpdatedEvent
    );
    connection.on(
      SignalRHubMethods.MessageDeleted,
      roomHandlers.onMessageDeleted
    );

    // Contacts

    connection.on(
      SignalRHubMethods.ContactStateChanged,
      contactHandlers.onContactStateChangedEvent
    );
    connection.on(
      SignalRHubMethods.ContactRequestReceived,
      contactHandlers.onContactRequestReceivedEvent
    );
    connection.on(
      SignalRHubMethods.ContactUpdateRequired,
      contactHandlers.onContactUpdateRequired
    );
    connection.on(
      SignalRHubMethods.ContactDeleted,
      contactHandlers.onContactDeleteEvent
    );
    connection.on(
      SignalRHubMethods.ContactUpdated,
      contactHandlers.onContactUpdatedEvent
    );

    connection.on(
      SignalRHubMethods.UserAddedToRoom,
      handleUserAddedToRoomActions
    );
    connection.on(
      SignalRHubMethods.UserRemovedFromRoom,
      handleUserRemovedFromRoomActions
    );

    // DM

    connection.on(
      SignalRHubMethods.DirectMessageIncoming,
      dmHandlers.onIncomingDirectMessage
    );
    connection.on(
      SignalRHubMethods.DirectMessageWasViewed,
      dmHandlers.onDirectMessageWasViewed
    );
    connection.on(
      SignalRHubMethods.DirectMessagesWereViewed,
      dmHandlers.onDirectMessagesWereViewed
    );
    connection.on(
      SignalRHubMethods.DirectMessageDeleted,
      dmHandlers.onDirectMessageDeleted
    );

    // E2E

    connection.on(
      SignalRHubMethods.DMKeyRequested,
      e2eHandlers.onDMKeyRequested
    );
    connection.on(SignalRHubMethods.DMKeyIncoming, e2eHandlers.onDMKeyIncoming);

    connection.on(
      SignalRHubMethods.RoomKeyRequested,
      e2eHandlers.onRoomKeyRequested
    );
    connection.on(
      SignalRHubMethods.RoomKeyIncoming,
      e2eHandlers.onRoomKeyIncoming
    );

    connection.on(
      SignalRHubMethods.MasterKeyRequested,
      e2eHandlers.onMasterKeyRequested
    );
    connection.on(
      SignalRHubMethods.MasterKeyIncoming,
      e2eHandlers.onMasterKeyIncoming
    );

    // Disconnect from events on connection close
    connection.onclose(async () => {
      connection.off(SignalRHubMethods.SendScreenShareStateChange);
      connection.off(SignalRHubMethods.VideoCallApproved);
      connection.off(SignalRHubMethods.VideoCallRejected);
      connection.off(SignalRHubMethods.VideoCallRequested);
      connection.off(SignalRHubMethods.VideoCallTerminated);
      connection.off(SignalRHubMethods.ICECandidateIncoming);
      connection.off(SignalRHubMethods.WebRTCOfferIncoming);
      connection.off(SignalRHubMethods.WebRTCAnswerIncoming);
      connection.off(SignalRHubMethods.ContactStateChanged);
      connection.off(SignalRHubMethods.MessageWasViewed);
      connection.off(SignalRHubMethods.MessagesWereViewed);
      connection.off(SignalRHubMethods.MessageIncoming);
      connection.off(SignalRHubMethods.RoomDeleted);
      connection.off(SignalRHubMethods.UserAddedToRoom);
      connection.off(SignalRHubMethods.RoomUpdated);
      connection.off(SignalRHubMethods.UserRemovedFromRoom);
      connection.off(SignalRHubMethods.ContactRequestReceived);
      connection.off(SignalRHubMethods.ContactUpdated);
      connection.off(SignalRHubMethods.ContactDeleted);
      connection.off(SignalRHubMethods.MessageDeleted);

      connection.off(SignalRHubMethods.DirectMessageIncoming);
      connection.off(SignalRHubMethods.DirectMessageDeleted);
      connection.off(SignalRHubMethods.DirectMessageWasViewed);
      connection.off(SignalRHubMethods.DirectMessagesWereViewed);
      connection.off(SignalRHubMethods.ContactUpdateRequired);

      // E2E

      connection.off(SignalRHubMethods.DMKeyRequested);
      connection.off(SignalRHubMethods.DMKeyIncoming);

      connection.off(SignalRHubMethods.RoomKeyRequested);
      connection.off(SignalRHubMethods.RoomKeyIncoming);

      connection.off(SignalRHubMethods.MasterKeyRequested);
      connection.off(SignalRHubMethods.MasterKeyIncoming);

      console.warn("Connection Closed - connection.onclose");
    });

    connection.onreconnected(async (connectionId) => {
      try {
        signalRStore.updateConnectionState();
        appStore.updateLoadingOverlay(true);
        console.warn("SIGNALR RECONNECTED", connectionId);
        await reconnectedActions();
      } catch (error) {
        console.error("SIGNALR RECONNECTION ERROR", error);
      } finally {
        appStore.updateLoadingOverlay(false);
        signalRStore.updateConnectionState();
      }
    });

    connection.onclose((error) => {
      signalRStore.updateConnectionState();
      console.warn("SignalR Connection Closed", error);
    });

    console.log("Starting Connection ...");
    await connection.start();
    signalRStore.updateConnectionValue(connection);
    signalRStore.updateConnectionState();
  };

  const reconnectedActions = async () => {
    console.warn("RECONNECTED ACTIONS");
    const promises = [];

    // Call Logs

    if (chatStore.callLogs.length > 0) {
      promises.push(
        videoCalls
          .getCallLogs(Math.max(...chatStore.callLogs.map((o) => o.id)))
          .then((res) => console.log("Call logs", res))
      );
    } else {
      promises.push(
        videoCalls.getCallLogs().then((res) => chatStore.loadCallLogs(res))
      );
    }

    // Contacts

    promises.push(
      chatApi.getConstacts().then((res) => {
        res.forEach((cr) => {
          e2e.tryDecryptContact(cr);
        });
        if (
          chatStore.activeContactId &&
          !res.some((c) => c.id === chatStore.activeContactId)
        ) {
          chatStore.activeContactId = null;
        }
        chatStore.loadContacts(res);
      })
    );

    // Rooms

    promises.push(
      chatApi.getRooms().then((res) => {
        res.forEach((room) => {
          e2e.tryDecryptRoom(room);
        });
        if (
          chatStore.activeRoomId &&
          !res.some((r) => r.id === chatStore.activeRoomId)
        ) {
          chatStore.activeRoomId = null;
        }
        chatStore.loadRooms(res);
      })
    );

    try {
      await Promise.all(promises).then(async (res) => {
        connectToRooms(chatStore.availableRooms.map((r) => r.id));
        await updateViewedMessages();
      });
    } catch (error) {
      console.error("Reconnection Refresh Error", error);
    }
  };

  const connect = async () => {
    signalRStore.updateConnectionState();
    if (
      signalRStore.connection &&
      signalRStore.connection.state === signalR.HubConnectionState.Connected
    ) {
      console.log("Already Connected");
    }
    if (
      signalRStore.connection &&
      signalRStore.connection.state === signalR.HubConnectionState.Disconnected
    ) {
      console.log("Starting Current Connection, connecting to Rooms");
      await signalRStore.connection.start();
      signalRStore.updateConnectionState();
      return;
    }
    if (!signalRStore.connection) {
      await createNewConnection();
      signalRStore.updateConnectionState();
    }
  };

  const updateViewedMessages = async () => {
    console.log(
      "Viewed messages update",
      chatStore.activeRoomId,
      chatStore.activeContactId,
      chatStore.activeChatTab
    );

    if (
      chatStore.activeRoomId &&
      chatStore.getActiveRoom.hasKey &&
      chatStore.activeChatTab === ChatViews.Messages
    ) {
      try {
        const markMessagesAsVieved =
          chatStore.getActiveRoom.messages.filter((m) => !m.wasViewed).length >
          0;

        console.log(
          "Nav Update -> Marking Room messages as viewed",
          markMessagesAsVieved
        );

        if (markMessagesAsVieved) {
          console.log("Nav Update -> Marking messages as viewed");
          await chatApi.markMessagesAsViewed(chatStore.activeRoomId);
          chatStore.markActiveRoomMessagesAsViewed();
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (
      chatStore.activeContactId &&
      chatStore.getActiveContact.hasKey &&
      chatStore.activeChatTab === ChatViews.Messages
    ) {
      try {
        const markMessagesAsVieved =
          chatStore.getActiveContact.directMessages.filter(
            (m) =>
              !m.wasViewed && m.nameSentBy !== userStore.getUserName && !m.error
          ).length > 0;

        console.log(
          "Nav Update -> Marking Contact messages as viewed",
          markMessagesAsVieved
        );

        if (markMessagesAsVieved) {
          console.log("Nav Update -> Marking messages as viewed");
          await chatApi.markDirectMessagesAsViewed(chatStore.activeContactId);
          chatStore.markDirectMessagesAsViewed(chatStore.activeContactId);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Rooms

  const handleUserAddedToRoomActions = (data: IRoom) => {
    connectToRoom(data.id);
    roomHandlers.handleUserAddedToRoom(data);
  };

  const connectToRooms = async (roomIds: string[]) => {
    if (
      !signalRStore.connection ||
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("Cant connect to Rooms");
      return;
    }

    if (roomIds.length == 0) {
      console.log("No rooms to connect with");
      return;
    }

    console.log("Connecting to Rooms", roomIds);
    await signalRStore.connection
      .invoke(SignalRHubMethods.ConnectToRooms, {
        RoomIds: roomIds,
      })
      .then((result) => {
        console.log("Connected to rooms", result);
      });
  };

  const connectToRoom = (roomId: string) => {
    if (
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("Cant connect to Rooms");
      return;
    }

    if (!roomId) {
      console.warn("Incorect Room Id");
      return;
    }

    console.log("Connecting to Room", roomId);
    signalRStore.connection
      .invoke(SignalRHubMethods.ConnectToRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("Connected to room", result);
      });
  };

  const disconnectFromRoom = (roomId: string) => {
    if (
      signalRStore.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("Cant disconnect from Room");
      return;
    }

    if (!roomId) {
      console.warn("Incorect Room Id");
      return;
    }

    console.log("Disconnecting from Room", roomId);
    signalRStore.connection
      .invoke(SignalRHubMethods.DisconnectFromRoom, {
        Id: roomId,
      })
      .then((result) => {
        console.log("Disconnected from room", result);
        e2e.removeKey(roomId, LocalStoreTypes.E2EROOMS);
      });
  };

  const createRoom = (roomName: string) => {
    console.log("Connection state:", signalRStore.connection.state);
    console.log("SignalR Creating Room:", roomName);
    signalRStore.connection
      .invoke(SignalRHubMethods.CreateRoom, {
        RoomName: roomName,
      })
      .then(async (newRoom: IRoom) => {
        console.log("New room created", newRoom);

        newRoom.hasKey = true;
        chatStore.addRoom(newRoom);
        connectToRoom(newRoom.id);

        console.log("Calling for new key");
        const key = await e2e.getNewKey();
        const newKeyData: E2EKey = {
          id: newRoom.id,
          key: key,
        };
        console.log("Saving new key", key);
        const result = e2e.addKey(newKeyData, LocalStoreTypes.E2EROOMS);
        console.log("Updated keys", result);

        appStore.showSuccessSnackbar("Room created");
        return newRoom.id;
      })
      .catch((err) => {
        if (err.message.indexOf("auth_expired") > 0) {
          console.log("Auth cookie expored");
          navigateTo("/user/login");
        } else {
          throw err;
        }
      });
  };

  // Room Handlers

  const handleUserRemovedFromRoomActions = (options: IUserRoomOptions) => {
    console.warn("Handling UserRemovedFromRoom in SignalR", options);
    if (userStore.getUserName === options.userName) {
      console.warn("Active user is being removed - signalR");
      disconnectFromRoom(options.roomId);
      roomHandlers.handleUserRemovedFromRoom(options);
      return;
    }

    console.warn("Other user is being removed - signalR");
    roomHandlers.handleUserRemovedFromRoom(options);
  };

  return {
    connectToRooms,
    connectToRoom,
    createRoom,
    connect,
  };
};
