import { ChatViews, VisibilityStates } from "~/utilities/globalEnums";

export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();
  const e2e = useE2Encryption();

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
                if (e2e.checkE2ECookie(r.id)) {
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
                if (e2e.checkE2ECookie(r.id)) {
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
              if (e2e.checkE2ECookie(r.id)) {
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
          "--> Nav Update -> Marking messages as viewed",
          markMessagesAsVieved
        );

        if (markMessagesAsVieved) {
          console.log("--> Nav Update -> Marking messages as viewed");
          await chatApi.markMessagesAsViewed(chatStore.activeRoomId);
          chatStore.markMessagesAsViewed();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return { handleVisibilityChange, handleOnlineChange, handleOfflineChange };
};
