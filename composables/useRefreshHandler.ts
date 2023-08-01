import {
  ChatViews,
  VisibilityStates,
  LocalStoreTypes,
  SignalRHubMethods,
} from "~/utilities/globalEnums";

export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();
  const userStore = useUserStore();
  const videoCall = useVideoCall();
  const e2e = useE2Encryption();
  const signalRStore = useSignalRStore();

  const handleOnMountedLoad = async () => {
    await Promise.all([
      chatApi.getConstacts().then((res) => {
        res.forEach((cr) => {
          e2e.tryDecryptContact(cr);
        });
        chatStore.loadContacts(res);
      }),
      videoCall.getCallLogs().then((res) => chatStore.loadCallLogs(res)),
      chatApi.getRooms().then((res) => {
        res.forEach((room) => {
          e2e.tryDecryptRoom(room);
        });
        return chatStore.loadRooms(res);
      }),
    ]);

    await signalR.connect();
  };

  const handleVisibilityChange = async () => {
    console.log("Visibility changed", document.visibilityState);
    if (document.visibilityState !== VisibilityStates.VISIBLE) {
      return;
    }

    appStore.updateLoadingOverlay(true);
    await refreshActions();
    appStore.updateLoadingOverlay(false);
  };

  const askForMissingKeys = () => {
    if (chatStore.getOnlineUsers.length === 0) {
      return;
    }
    console.warn("Asking online users for keys", chatStore.getOnlineUsers);

    const missingKeys = e2e.getMissingKeys();
    if (missingKeys.length === 0) {
      return;
    }
    console.warn("Missing keys", missingKeys);

    const keyHolders = missingKeys
      .map((mk) => mk.keyHolders)
      .reduce((a, b) => {
        return a.concat(b);
      }, []);
    const uniqueKeyholders = [...new Set(keyHolders)];
    const availableKeyHolders = chatStore.getOnlineUsers.filter(
      (ou) => (onlineUser: IContactRequest) =>
        uniqueKeyholders.find((kh) => kh === onlineUser.displayName)
    );

    if (availableKeyHolders.length === 0) {
      return;
    }

    console.warn("Available keyholders", availableKeyHolders);

    missingKeys.forEach((missingKey) => {
      missingKey.keyHolders.forEach((keyHolder) => {
        if (!availableKeyHolders.some((akh) => akh.displayName === keyHolder))
          return;
        if (missingKey.type === LocalStoreTypes.E2EDM) {
          const request: DMKeyRequest = {
            id: missingKey.id as number,
            receipient: userStore.getUserName,
            keyHolder: keyHolder,
          };

          console.log("Asking DM key", keyHolder);
          signalRStore.connection.send(SignalRHubMethods.RequestDMKey, request);
          return;
        }
        if (missingKey.type === LocalStoreTypes.E2EROOMS) {
          const request: RoomKeyRequest = {
            id: missingKey.id as string,
            receipient: userStore.getUserName,
          };

          console.log("Asking Room key", keyHolder);
          signalRStore.connection.send(
            SignalRHubMethods.RequestRoomKey,
            request
          );
          return;
        }
      });
    });
  };

  const handleOnlineChange = async () => {
    console.log("Online status changed");
    appStore.updateLoadingOverlay(false);
    appStore.updateOnlineState(true);
    await refreshActions();
    appStore.updateLoadingOverlay(false);
  };

  const handleOfflineChange = async () => {
    appStore.updateOnlineState(false);
    appStore.updateLoadingOverlay(true);
  };

  const refreshActions = async () => {
    const promises = [
      chatApi.getConstacts().then((res) => {
        res.forEach((cr) => {
          e2e.tryDecryptContact(cr);
        });
        chatStore.loadContacts(res);
      }),
    ];

    if (chatStore.callLogs.length > 0) {
      promises.push(
        videoCall
          .getCallLogs(Math.max(...chatStore.callLogs.map((o) => o.id)))
          .then((res) => console.log("Call logs", res))
      );
    } else {
      promises.push(
        videoCall.getCallLogs().then((res) => chatStore.loadCallLogs(res))
      );
    }

    console.warn("Getting All Rooms");
    promises.push(
      chatApi.getRooms().then((res) => {
        res.forEach((room) => {
          e2e.tryDecryptRoom(room);
        });
        return chatStore.loadRooms(res);
      })
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Update Error", error);
    }

    await signalR.connect();
    askForMissingKeys();

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

  return {
    askForMissingKeys,
    handleOnMountedLoad,
    handleVisibilityChange,
    handleOnlineChange,
    handleOfflineChange,
  };
};
