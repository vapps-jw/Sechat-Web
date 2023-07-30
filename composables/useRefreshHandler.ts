import {
  ChatViews,
  VisibilityStates,
  LocalStoreTypes,
} from "~/utilities/globalEnums";

export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();
  const userStore = useUserStore();
  const videoCall = useVideoCall();
  const e2e = useE2Encryption();

  const decryptDMs = (crs: IContactRequest[]) => {
    const keys = e2e.getKeys(LocalStoreTypes.E2EDM);
    crs.forEach((cr) => {
      const key = keys?.find((k) => k.id === cr.id);
      if (!key) {
        cr.hasKey = false;
        cr.directMessages.forEach((dm) => (dm.decrypted = false));
        return;
      }
      cr.hasKey = true;
      cr.directMessages.forEach((dm) => {
        dm.text = e2e.decryptMessage(dm.text, key);
        dm.decrypted = true;
      });
    });
  };

  const handleOnMountedLoad = async () => {
    await Promise.all([
      chatApi.getConstacts().then((res) => {
        decryptDMs(res);
        chatStore.loadContacts(res);
      }),
      videoCall.getCallLogs().then((res) => chatStore.loadCallLogs(res)),
      chatApi.getRooms().then((res) => chatStore.loadRooms(res)),
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

  const handleOnlineChange = async () => {
    console.log("Online status changed");
    appStore.updateLoadingOverlay(false);
    appStore.updateOnlineState(true);

    await refreshActions();
  };

  const handleOfflineChange = async () => {
    appStore.updateOnlineState(false);
    appStore.updateLoadingOverlay(true);
  };

  const refreshActions = async () => {
    const promises = [
      chatApi.getConstacts().then((res) => {
        decryptDMs(res);
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
    promises.push(chatApi.getRooms().then((res) => chatStore.loadRooms(res)));

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Update Error", error);
    }

    await signalR.connect();

    console.log(
      "Viewed messages update",
      chatStore.activeRoomId,
      chatStore.activeContactId,
      chatStore.activeChatTab
    );

    if (
      chatStore.activeRoomId &&
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
    handleOnMountedLoad,
    handleVisibilityChange,
    handleOnlineChange,
    handleOfflineChange,
  };
};
