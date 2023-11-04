import { ChatViews, VisibilityStates } from "~/utilities/globalEnums";
import { HubConnectionState } from "@microsoft/signalr";

export const useRefreshHandler = () => {
  const appStore = useSechatAppStore();
  const signalR = useSignalR();
  const chatApi = useChatApi();
  const chatStore = useSechatChatStore();
  const userStore = useUserStore();
  const videoCall = useVideoCall();
  const e2e = useE2Encryption();
  const signalRStore = useSignalRStore();
  const webRTCStore = useWebRTCStore();
  const calendarStore = useCalendarStore();

  const initialLoad = async () => {
    //appStore.updateLoadingOverlayWithMessage(true, "Loading Messages...");

    if (chatStore.lazyLoadInProgress) {
      //appStore.updateLoadingOverlay(false);
      return;
    } else {
      chatStore.lazyLoadInProgress = true;
    }

    console.warn("Resetting chatStore");
    chatStore.$reset();
    console.warn("Resetting webRTCStore");
    webRTCStore.$reset();

    await signalRStore.closeConnection();
    signalRStore.$reset();
    chatStore.$reset();
    await signalR.connect();

    Promise.all([
      videoCall.getCallLogs().then((res) => chatStore.loadCallLogs(res)),
      chatApi.getRoomsMetadata().then((res) => {
        console.warn("Initial load - rooms", res);
        chatStore.loadRooms(res);
      }),
      chatApi.getConstactsMetadata().then((res) => {
        console.warn("Initial load - contacts", res);
        chatStore.loadContacts(res);
      }),
    ])
      .then(async (res) => {
        console.warn("Initial load - sync keys, connect to rooms");
        e2e.updateHasKeyFlag();
        e2e.askForMissingKeys();
        e2e.syncWithOtherDevice();
        e2e.clearUnusedKeys();

        await signalR.connectToRooms(chatStore.availableRooms.map((r) => r.id));
        //appStore.updateLoadingOverlay(false);
      })
      .then(async (res) => {
        console.warn("Initial load - loading messages and decrypting");
        const promises = [];
        chatStore.availableRooms.forEach((r) => {
          r.messages.forEach((m) => {
            if (m.loaded) {
              return;
            }
            promises.push(
              chatApi.getRoomMessage(r.id, m.id).then((res) => {
                e2e.tryDecryptRoomMessage(res);
                chatStore.updateRoomMessage(res);
              })
            );
          });
        });
        chatStore.availableContacts.forEach((c) => {
          c.directMessages.forEach((m) => {
            if (m.loaded) {
              return;
            }
            promises.push(
              chatApi.getConstactMessage(c.id, m.id).then((res) => {
                e2e.tryDecryptContactMessage(res);
                chatStore.updateContactMessage(res);
              })
            );
          });
        });
        await Promise.all(promises);
      })
      .finally(async () => {
        chatStore.lazyLoadInProgress = false;
      });
  };

  const handleVisibilityChange = async () => {
    console.log("Visibility changed", document.visibilityState);
    if (document.visibilityState !== VisibilityStates.VISIBLE) {
      return;
    }
    await updateLoadLazy();
    calendarStore.recalculateEvents();
    calendarStore.recalculateBatches();
  };

  const handleOnlineChange = async () => {
    console.warn("Online status changed");
    appStore.updateOnlineState(true);
    await updateLoadLazy();
    //appStore.updateLoadingOverlay(false);
  };

  const handleOfflineChange = async () => {
    //appStore.updateLoadingOverlay(true);
  };

  const updateLoadLazy = async () => {
    console.warn("Update Load Lazy", chatStore.lazyLoadInProgress);
    console.log("Stored Contacts", chatStore.availableContacts);
    console.log("Stored Rooms", chatStore.availableRooms);

    console.warn("Last Room message", chatStore.lastMessageInRooms);
    console.warn("Last DM message", chatStore.lastMessageInContacts);

    if (chatStore.lazyLoadInProgress) {
      //appStore.updateLoadingOverlay(false);
      return;
    } else {
      chatStore.lazyLoadInProgress = true;
    }

    if (
      signalRStore.connection &&
      signalRStore.connection.state !== HubConnectionState.Connected
    ) {
      console.log("Handling SignalR");
      await signalRStore.closeConnection();
      signalRStore.$reset();
      await signalR.connect();
    }

    //appStore.updateLoadingOverlayWithMessage(true, "Updating Messages...");
    Promise.all([
      videoCall.getCallLogs().then((res) => chatStore.loadCallLogs(res)),
      chatStore.lastMessageInRooms !== 0
        ? chatApi
            .getRoomsUpdateMetadata(chatStore.lastMessageInRooms)
            .then((res) => {
              console.warn("Update load - rooms", res);
              chatStore.updateRooms(res);
            })
        : chatApi.getRoomsMetadata().then((res) => {
            console.warn("Update load - rooms", res);
            chatStore.loadRooms(res);
          }),
      chatStore.lastMessageInContacts !== 0
        ? chatApi
            .getConstactsUpdateMetadata(chatStore.lastMessageInContacts)
            .then((res) => {
              console.warn("Update load - contacts", res);
              chatStore.updateContacts(res);
            })
        : chatApi.getConstactsMetadata().then((res) => {
            console.warn("Update load - contacts", res);
            chatStore.loadContacts(res);
          }),
    ])
      .then(async (res) => {
        console.warn("Update load - sync keys, connect to rooms");
        e2e.updateHasKeyFlag();
        e2e.askForMissingKeys();
        e2e.syncWithOtherDevice();
        e2e.clearUnusedKeys();

        await signalR.connectToRooms(chatStore.availableRooms.map((r) => r.id));
        //appStore.updateLoadingOverlay(false);
      })
      .then(async (res) => {
        console.warn("Update load - loading messages and decrypting");
        const promises = [];
        chatStore.availableRooms.forEach((r) => {
          r.messages.forEach((m) => {
            if (m.loaded) {
              return;
            }
            promises.push(
              chatApi.getRoomMessage(r.id, m.id).then((res) => {
                e2e.tryDecryptRoomMessage(res);
                chatStore.updateRoomMessage(res);
              })
            );
          });
        });
        chatStore.availableContacts.forEach((c) => {
          c.directMessages.forEach((m) => {
            if (m.loaded) {
              return;
            }
            promises.push(
              chatApi.getConstactMessage(c.id, m.id).then((res) => {
                e2e.tryDecryptContactMessage(res);
                chatStore.updateContactMessage(res);
              })
            );
          });
        });
        await Promise.all(promises);
      })
      .finally(async () => {
        await updateViewedMessages();
        chatStore.lazyLoadInProgress = false;
      });
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

  const fullRefresh = async () => {
    console.warn("Full Refresh");

    if (chatStore.lazyLoadInProgress) {
      //appStore.updateLoadingOverlay(false);
      return;
    } else {
      chatStore.lazyLoadInProgress = true;
    }

    console.warn("Resetting chatStore");
    chatStore.$reset();
    console.warn("Resetting webRTCStore");
    webRTCStore.$reset();

    await signalRStore.closeConnection();
    signalRStore.$reset();
    await signalR.connect();
    const promises = [];

    // Call Logs

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
      await Promise.all(promises);

      if (signalRStore.connection?.state === HubConnectionState.Connected) {
        console.log("SignalR Connected, processing Fetch");
        e2e.askForMissingKeys();
        e2e.syncWithOtherDevice();
        e2e.clearUnusedKeys();
      }

      console.log("Connecting to Rooms");
      await signalR.connectToRooms(chatStore.availableRooms.map((r) => r.id));
      await updateViewedMessages();
    } catch (error) {
      console.error("Update Error", error);
    }
  };

  const signOutCleanup = async () => {
    await signalRStore.closeConnection();
    console.warn("Resetting chatStore");
    chatStore.$reset();
    console.warn("Resetting signalRStore");
    signalRStore.$reset();
    console.warn("Resetting webRTCStore");
    webRTCStore.$reset();
    console.warn("Resetting userStore");
    userStore.$reset();

    if ("serviceWorker" in navigator) {
      console.warn("Full Cache Cleanup");
      const cacheNames = await caches.keys();
      cacheNames.forEach((cacheName) => {
        console.warn("Deleting Chache", cacheNames);
        caches.delete(cacheName);
      });
    }
  };

  return {
    updateLoadLazy,
    initialLoad,
    fullRefresh,
    signOutCleanup,
    handleVisibilityChange,
    handleOnlineChange,
    handleOfflineChange,
  };
};
