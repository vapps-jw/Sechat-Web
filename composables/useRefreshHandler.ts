import {
  ChatViews,
  CustomCookies,
  VisibilityStates,
} from "~/utilities/globalEnums";

export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();
  const e2e = useE2Encryption();
  const userStore = useUserStore();
  const videoCall = useVideoCall();

  const handleOnMountedLoad = async () => {
    await Promise.all([
      chatApi.getConstacts().then((res) => chatStore.loadContacts(res)),
      videoCall.getCallLogs().then((res) => chatStore.loadCallLogs(res)),
      chatApi.getRooms().then((res) => {
        res.forEach((r) => {
          if (r.encryptedByUser) {
            if (e2e.checkCookie(r.id, CustomCookies.E2E)) {
              r.hasKey = true;
              return;
            }
            r.hasKey = false;
          }
        });

        chatStore.loadRooms(res);
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
      chatApi.getConstacts().then((res) => chatStore.loadContacts(res)),
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

    if (chatStore.availableRooms.length > 0) {
      console.warn("Available Rooms", chatStore.availableRooms);
      const updates = chatStore.availableRooms.map(
        (r) =>
          <IRoomUpdateRequest>{
            roomId: r.id,
            lastMessage: r.messages.length == 0 ? 0 : r.messages.at(-1).id,
          }
      );
      if (updates.length > 0) {
        console.log("Calling Room Updates", updates);
        promises.push(
          chatApi.getRoomsUpdate(updates).then((res) => {
            res.forEach((r) => {
              if (r.encryptedByUser) {
                if (e2e.checkCookie(r.id, CustomCookies.E2E)) {
                  r.hasKey = true;
                  return;
                }
                r.hasKey = false;
              }
            });

            chatStore.updateRooms(res);
          })
        );
      } else {
        console.warn("Getting All Rooms");
        promises.push(
          chatApi.getRooms().then((res) => {
            res.forEach((r) => {
              if (r.encryptedByUser) {
                if (e2e.checkCookie(r.id, CustomCookies.E2E)) {
                  r.hasKey = true;
                  return;
                }
                r.hasKey = false;
              }
            });

            chatStore.loadRooms(res);
          })
        );
      }
    } else {
      console.warn("Getting All Rooms");
      promises.push(
        chatApi.getRooms().then((res) => {
          res.forEach((r) => {
            if (r.encryptedByUser) {
              if (e2e.checkCookie(r.id, CustomCookies.E2E)) {
                r.hasKey = true;
                return;
              }
              r.hasKey = false;
            }
          });

          chatStore.loadRooms(res);
        })
      );
    }

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
          "--> Nav Update -> Marking Room messages as viewed",
          markMessagesAsVieved
        );

        if (markMessagesAsVieved) {
          console.log("--> Nav Update -> Marking messages as viewed");
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
            (m) => !m.wasViewed && m.nameSentBy !== userStore.getUserName
          ).length > 0;

        console.log(
          "--> Nav Update -> Marking Contact messages as viewed",
          markMessagesAsVieved
        );

        if (markMessagesAsVieved) {
          console.log("--> Nav Update -> Marking messages as viewed");
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
