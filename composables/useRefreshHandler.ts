import { ChatViews, VisibilityStates } from "~/utilities/globalEnums";

export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();

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
      const updates = chatStore.availableRooms
        .filter((r) => r.messages.length > 0)
        .map(
          (r) =>
            <IRoomUpdateRequest>{
              roomId: r.id,
              lastMessage: r.messages.at(-1).created,
            }
        );
      if (updates.length > 0) {
        console.log("Calling Room Updates", updates);
        promises.push(
          chatApi
            .getRoomsUpdate(updates)
            .then((res) => chatStore.updateRooms(res))
        );
      } else {
        console.warn("Getting All Rooms");
        promises.push(
          chatApi.getRooms().then((res) => chatStore.loadRooms(res))
        );
      }
    } else {
      console.warn("Getting All Rooms");
      promises.push(chatApi.getRooms().then((res) => chatStore.loadRooms(res)));
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
        const markMessagesAsVided =
          chatStore.getActiveRoom.messages.filter((m) => !m.wasViewed).length >
          0;

        console.log(
          "--> Nav Update -> Marking messages as viewed",
          markMessagesAsVided
        );

        if (markMessagesAsVided) {
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
