import { SignalRHubMethods, LocalStoreTypes } from "~~/utilities/globalEnums";

export const useE2EHandlers = () => {
  const chatStore = useSechatChatStore();
  const signalRStore = useSignalRStore();
  const e2e = useE2Encryption();

  const onDMKeyRequested = async (message: DMKeyRequest) => {
    console.warn("DMKeyRequested by", message.receipient);

    const key = e2e.getKey(message.id, LocalStoreTypes.E2EDM);
    if (!key) {
      console.log("Key not found");
      return;
    }

    const keyToShare: DMSharedKey = {
      key: key.key,
      receipient: message.receipient,
      id: message.id,
    };

    console.log("Sending DM key", keyToShare);
    signalRStore.connection.send(SignalRHubMethods.ShareDMKey, keyToShare);
  };

  const onDMKeyIncoming = async (message: DMSharedKey) => {
    console.warn("onDMKeyIncoming", message);

    const newKey: E2EKey = {
      key: message.key,
      id: message.id,
    };

    console.log("Updating key", newKey);
    const result = e2e.addKey(newKey, LocalStoreTypes.E2EDM);
    console.log("Key Updated", result);

    const contact = chatStore.availableContacts.find(
      (c) => c.id === message.id
    );
    e2e.tryDecryptContact(contact);
  };

  const onRoomKeyRequested = (message: RoomKeyRequest) => {
    console.warn("Room Key requested");

    const key = e2e.getKey(message.id, LocalStoreTypes.E2EROOMS);
    if (!key) {
      console.log("Key not found");
      return;
    }

    const keyToShare: RoomSharedKey = {
      key: key.key,
      receipient: message.receipient,
      id: message.id,
    };

    console.log("Sending Room key", keyToShare);
    signalRStore.connection.send(SignalRHubMethods.ShareRoomKey, keyToShare);
  };

  const onRoomKeyIncoming = (message: RoomSharedKey) => {
    console.warn("onRoomKeyIncoming", message);

    const newKey: E2EKey = {
      key: message.key,
      id: message.id,
    };

    const result = e2e.addKey(newKey, LocalStoreTypes.E2EROOMS);
    console.log("Key Updated", result);

    const room = chatStore.availableRooms.find((c) => c.id === message.id);
    e2e.tryDecryptRoom(room);
  };

  const onMasterKeyRequested = () => {
    console.warn("Master Key requested");

    const keys = e2e.getKeys(LocalStoreTypes.E2EMASTER);
    if (keys.length === 0) {
      console.log("Master Key not found");
      return;
    }

    const mostRecentKey = keys.reduce((a, b) => {
      return new Date(a.id) > new Date(b.id) ? a : b;
    });

    const keyToShare: MasterSharedKey = {
      key: mostRecentKey.key,
      id: mostRecentKey.id,
    };

    console.log("Sending Master key", keyToShare);
    signalRStore.connection.send(SignalRHubMethods.ShareMasterKey, keyToShare);
  };

  const onMasterKeyIncoming = (message: MasterSharedKey) => {
    console.warn("onMasterKeyIncoming", message);

    const newKey: E2EKey = {
      key: message.key,
      id: message.id,
    };

    const keys = e2e.getKeys(LocalStoreTypes.E2EMASTER);

    if (keys.length > 0) {
      const mostRecentKey = keys.reduce((a, b) => {
        return new Date(a.id) > new Date(b.id) ? a : b;
      });

      console.log("Most recent Master Key", mostRecentKey);
      if (new Date(newKey.id) <= new Date(mostRecentKey.id)) {
        console.log("Master Key is up to date");
        return;
      }
    }

    e2e.removeKeys(LocalStoreTypes.E2EMASTER);
    console.log("Saving refcent Master Key", newKey);
    const result = e2e.addKey(newKey, LocalStoreTypes.E2EMASTER);
    console.log("Master Key Updated", result);

    // Todo: try decrypt calendar
  };

  return {
    onMasterKeyIncoming,
    onMasterKeyRequested,
    onRoomKeyRequested,
    onRoomKeyIncoming,
    onDMKeyIncoming,
    onDMKeyRequested,
  };
};
