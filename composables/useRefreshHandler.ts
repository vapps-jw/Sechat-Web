import { ChatViews, VisibilityStates } from "~/utilities/globalEnums";

export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();

  const handleVisibilityChange = async () => {
    //signalRStore.clearVideoCallData();
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
    const chatState = await chatApi.getState();
    chatStore.loadRooms(chatState.rooms);
    chatStore.loadContacts(chatState.userContacts);
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
