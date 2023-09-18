import {
  ChatViews,
  VisibilityStates,
  LocalStoreTypes,
  SignalRHubMethods,
} from "~/utilities/globalEnums";
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

  const clearUnusedKeys = () => {
    const dmKeys = e2e.getKeys(LocalStoreTypes.E2EDM);
    const roomKeys = e2e.getKeys(LocalStoreTypes.E2EROOMS);

    const roomIds = chatStore.availableRooms.map((r) => r.id);
    const contactIds = chatStore.availableContacts.map((c) => c.id);

    if (dmKeys.length > 0) {
      const unusedDMKeys = dmKeys.filter(
        (dk) => !contactIds.some((cid) => cid === dk.id)
      );

      console.log("DM keys to clear", unusedDMKeys);
      unusedDMKeys.forEach((k) => e2e.removeKey(k.id, LocalStoreTypes.E2EDM));
    }

    if (roomKeys.length > 0) {
      const unusedRoomKeys = roomKeys.filter(
        (dk) => !roomIds.some((cid) => cid === dk.id)
      );

      console.log("Room keys to clear", unusedRoomKeys);
      unusedRoomKeys.forEach((k) =>
        e2e.removeKey(k.id, LocalStoreTypes.E2EROOMS)
      );
    }
  };

  const handleOnMountedLoad = async () => {
    appStore.updateLoadingOverlay(true);
    await signalRStore.closeConnection();
    signalRStore.$reset();
    chatStore.$reset();

    await signalR.connect();
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

    if (signalRStore.connection?.state === HubConnectionState.Connected) {
      console.log("SignalR Connected, processing Fetch");
      askForMissingKeys();
      syncWithOtherDevice();
      clearUnusedKeys();
    }

    await signalR.connectToRooms(chatStore.availableRooms.map((r) => r.id));
    appStore.updateLoadingOverlay(false);
  };

  const handleVisibilityChange = async () => {
    console.log("Visibility changed", document.visibilityState);
    if (document.visibilityState !== VisibilityStates.VISIBLE) {
      return;
    }

    await visibilityChangeRefresh();
  };

  const syncWithOtherDevice = () => {
    console.warn("Synchronizing missing keys with other devices");
    const missingDmKeys = chatStore.availableContacts.filter(
      (item) => item.approved && !item.hasKey
    );
    console.log("Missing DM keys to synchronize", missingDmKeys);
    missingDmKeys.forEach((missingKey) => {
      const request: DMKeyRequest = {
        id: missingKey.id as number,
        receipient: userStore.getUserName,
        keyHolder: userStore.getUserName,
      };

      console.warn("Synchronizing DM key", missingKey.id);
      signalRStore.connection.send(SignalRHubMethods.RequestDMKey, request);
    });

    const missingRoomKeys = chatStore.availableRooms.filter(
      (item) => !item.hasKey
    );
    console.log("Missing Room keys to synchronize", missingRoomKeys);
    missingRoomKeys.forEach((missingKey) => {
      const request: RoomKeyRequest = {
        id: missingKey.id as string,
        receipient: userStore.getUserName,
      };

      console.warn("Synchronizing Room key", missingKey.id);
      signalRStore.connection.send(SignalRHubMethods.RequestRoomKey, request);
    });

    console.warn("Synchronizing Master key");
    signalRStore.connection.send(SignalRHubMethods.RequestMasterKey);
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

          console.warn("Asking for DM key", request);
          signalRStore.connection.send(SignalRHubMethods.RequestDMKey, request);
          return;
        }
        if (missingKey.type === LocalStoreTypes.E2EROOMS) {
          const request: RoomKeyRequest = {
            id: missingKey.id as string,
            receipient: userStore.getUserName,
          };

          console.warn("Asking for Room key", keyHolder);
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
    console.warn("Online status changed");
    appStore.updateOnlineState(true);
    await refreshActions();
    appStore.updateLoadingOverlay(false);
  };

  const handleOfflineChange = async () => {
    appStore.updateLoadingOverlay(true);
  };

  const visibilityChangeRefresh = async () => {
    console.warn("Visibility Change Refresh");
    if (
      signalRStore.connection &&
      signalRStore.connection.state === HubConnectionState.Connected
    ) {
      console.warn("SignalR connected - no updates");
      console.log("Connecting to Rooms");
      await signalR.connectToRooms(chatStore.availableRooms.map((r) => r.id));
      updateViewedMessages();
      return;
    }
    appStore.updateLoadingOverlay(true);

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
        askForMissingKeys();
        syncWithOtherDevice();
        clearUnusedKeys();

        console.log("Connecting to Rooms");
        await signalR.connectToRooms(chatStore.availableRooms.map((r) => r.id));
        await updateViewedMessages();
      }
    } catch (error) {
      console.error("Visibility Change Refresh Error", error);
    } finally {
      appStore.updateLoadingOverlay(false);
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

  const refreshActions = async () => {
    console.warn("REFRESH ACTIONS");
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
        askForMissingKeys();
        syncWithOtherDevice();
        clearUnusedKeys();
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
    refreshActions,
    visibilityChangeRefresh,
    signOutCleanup,
    clearUnusedKeys,
    syncWithOtherDevice,
    askForMissingKeys,
    handleOnMountedLoad,
    handleVisibilityChange,
    handleOnlineChange,
    handleOfflineChange,
  };
};
