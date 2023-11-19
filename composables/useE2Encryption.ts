import CryptoES from "crypto-es";
import { E2EStatusMessages } from "~~/utilities/e2eEnums";
import { LocalStoreTypes, SignalRHubMethods } from "~~/utilities/globalEnums";

export const useE2Encryption = () => {
  const config = useRuntimeConfig();
  const chatStore = useSechatChatStore();
  const userStore = useUserStore();
  const signalRStore = useSignalRStore();

  const clearUnusedKeys = () => {
    const dmKeys = getKeys(LocalStoreTypes.E2EDM);
    const roomKeys = getKeys(LocalStoreTypes.E2EROOMS);

    const roomIds = chatStore.availableRooms.map((r) => r.id);
    const contactIds = chatStore.availableContacts.map((c) => c.id);

    if (dmKeys.length > 0) {
      const unusedDMKeys = dmKeys.filter(
        (dk) => !contactIds.some((cid) => cid === dk.id)
      );

      console.log("DM keys to clear", unusedDMKeys);
      unusedDMKeys.forEach((k) => removeKey(k.id, LocalStoreTypes.E2EDM));
    }

    if (roomKeys.length > 0) {
      const unusedRoomKeys = roomKeys.filter(
        (dk) => !roomIds.some((cid) => cid === dk.id)
      );

      console.log("Room keys to clear", unusedRoomKeys);
      unusedRoomKeys.forEach((k) => removeKey(k.id, LocalStoreTypes.E2EROOMS));
    }
  };

  const askForMissingKeys = () => {
    if (chatStore.getOnlineUsers.length === 0) {
      return;
    }
    console.warn("Asking online users for keys", chatStore.getOnlineUsers);

    const missingKeys = getMissingKeys();
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

  const syncWithOtherDevice = () => {
    console.log("Synchronizing missing keys with other devices");
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

      console.log("Synchronizing DM key", missingKey.id);
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

      console.log("Synchronizing Room key", missingKey.id);
      signalRStore.connection.send(SignalRHubMethods.RequestRoomKey, request);
    });

    console.log("Synchronizing Master key");
    signalRStore.connection.send(SignalRHubMethods.RequestMasterKey);
  };

  const getMissingKeys = (): MissingKey[] => {
    const missingContactKeys = chatStore.availableContacts.filter(
      (c) => !c.hasKey
    );
    const missingRoomKeys = chatStore.availableRooms.filter((c) => !c.hasKey);

    const results: MissingKey[] = [];
    missingContactKeys.forEach((cr) => {
      results.push({
        type: LocalStoreTypes.E2EDM,
        id: cr.id,
        keyHolders: [cr.displayName],
      });
    });

    missingRoomKeys.forEach((room) => {
      const members = room.members.filter(
        (rm) => rm.userName !== userStore.getUserName
      );
      results.push({
        type: LocalStoreTypes.E2EROOMS,
        id: room.id,
        keyHolders: members.map((v) => v.userName),
      });
    });

    return results;
  };

  const updateHasKeyFlag = () => {
    chatStore.availableContacts.forEach((cr) => {
      const key = getKey(cr.id, LocalStoreTypes.E2EDM);
      if (key) {
        cr.hasKey = true;
      }
    });
    chatStore.availableRooms.forEach((room) => {
      const key = getKey(room.id, LocalStoreTypes.E2EROOMS);
      if (key) {
        room.hasKey = true;
      }
    });
  };

  const updateDMHasKeyFlag = (id: number) => {
    const contact = chatStore.availableContacts.find((c) => c.id === id);

    const key = getKey(contact.id, LocalStoreTypes.E2EDM);
    if (key) {
      contact.hasKey = true;
    }
  };

  const updateRoomHasKeyFlag = (id: string) => {
    const room = chatStore.availableRooms.find((room) => room.id === id);

    const key = getKey(room.id, LocalStoreTypes.E2EROOMS);
    if (key) {
      room.hasKey = true;
    }
  };

  const tryDecryptContact = (cr: IContactRequest) => {
    const key = getKey(cr.id, LocalStoreTypes.E2EDM);

    if (!key) {
      console.warn("Contact Key not found", cr);
      cr.hasKey = false;
      cr.directMessages?.forEach((dm) => {
        if (!dm.decrypted) {
          return;
        }
        dm.decrypted = false;
      });
      return;
    }
    console.warn("Decrypting Contact", cr, key);
    cr.hasKey = true;
    cr.directMessages?.forEach((message) => {
      tryDecryptContactMessage(message);
    });
  };

  const tryDecryptContactMessage = (message: IDirectMessage) => {
    if (message.decrypted && !message.error) {
      return;
    }
    if (!message.loaded) {
      return;
    }

    const key = getKey(message.contactId, LocalStoreTypes.E2EDM);

    if (!key) {
      console.warn("Contact Key not found", message);
      message.decrypted = false;
      return;
    }
    console.warn("Decrypting DM", message, key);
    if (message.decrypted) {
      return;
    }
    const decrypted = decryptMessage(message.text, key);
    if (decrypted === E2EStatusMessages.DECRYPTION_ERROR) {
      message.decrypted = false;
      message.error = true;
      return;
    }

    message.text = decrypted;
    message.decrypted = true;
    message.loaded = true;
    message.error = false;
  };

  const tryDecryptRoomMessage = (message: IMessage) => {
    if (message.decrypted && !message.error) {
      return;
    }
    if (!message.loaded) {
      return;
    }

    const key = getKey(message.roomId, LocalStoreTypes.E2EROOMS);

    if (!key) {
      console.warn("Room Key not found", message);
      message.decrypted = false;
      return;
    }
    console.warn("Decrypting Message", message, key);
    if (message.decrypted) {
      return;
    }
    const decrypted = decryptMessage(message.text, key);
    if (decrypted === E2EStatusMessages.DECRYPTION_ERROR) {
      message.decrypted = false;
      message.error = true;
      return;
    }

    message.text = decrypted;
    message.decrypted = true;
    message.loaded = true;
    message.error = false;
  };

  const tryDecryptRoom = (room: IRoom) => {
    console.warn("Decrypting room", room);
    const key = getKey(room.id, LocalStoreTypes.E2EROOMS);

    if (!key) {
      console.warn("Room Key not found", room);
      room.hasKey = false;
      room.messages?.forEach((dm) => (dm.decrypted = false));
      return;
    }
    console.warn("Decrypting Room", room, key);
    room.hasKey = true;
    room.messages?.forEach((message) => {
      tryDecryptRoomMessage(message);
    });
  };

  const encryptMessage = (data: string, key: E2EKey): string => {
    try {
      var result = CryptoES.AES.encrypt(data, key.key).toString();
      if (!result) {
        return E2EStatusMessages.ENCRYPTION_ERROR;
      }
      return result;
    } catch (error) {
      console.error(error);
      return E2EStatusMessages.ENCRYPTION_ERROR;
    }
  };

  const decryptMessage = (data: string, key: E2EKey): string => {
    try {
      var result = CryptoES.enc.Utf8.stringify(
        CryptoES.AES.decrypt(data, key.key)
      );
      if (!result) {
        return E2EStatusMessages.DECRYPTION_ERROR;
      }
      return result;
    } catch (error) {
      console.error(error);
      return E2EStatusMessages.DECRYPTION_ERROR;
    }
  };

  const addKey = (data: E2EKey, type: string): E2EKey[] => {
    if (!process.client) {
      console.error(process);
      return;
    }

    const storedData = localStorage.getItem(type);
    if (!storedData) {
      const newData = [{ key: data.key, id: data.id }];
      console.log("Adding first key");
      localStorage.setItem(type, JSON.stringify(newData));
      return newData;
    }

    let e2eData = JSON.parse(storedData) as E2EKey[];
    if (e2eData.some((key) => key.id === data.id && key.key === data.key)) {
      console.error("Key exists", data);
      return;
    }

    e2eData = e2eData.filter((key) => key.id !== data.id);
    e2eData.push({
      key: data.key,
      id: data.id,
    });
    const newData = JSON.stringify(e2eData);
    localStorage.setItem(type, newData);
    console.log("Updated keys", e2eData);
    return e2eData;
  };

  const getKeys = (type: string): E2EKey[] => {
    if (!process.client) {
      console.error(process);
      return <E2EKey[]>[];
    }

    const storedData = localStorage.getItem(type);
    if (!storedData) {
      return <E2EKey[]>[];
    }

    return JSON.parse(storedData) as E2EKey[];
  };

  const getMasterKey = (): E2EKey | null => {
    const storedData = localStorage.getItem(LocalStoreTypes.E2EMASTER);
    if (!storedData) {
      return null;
    }

    const keys = JSON.parse(storedData) as E2EKey[];
    if (keys.length > 0) {
      const mostRecentKey = keys.reduce((a, b) => {
        return new Date(a.id) > new Date(b.id) ? a : b;
      });
      const keysToRemove = keys.filter((k) => k.id !== mostRecentKey.id);

      console.log("Most recent Master Key", mostRecentKey);
      keysToRemove.forEach((k) => removeKey(k.id, LocalStoreTypes.E2EMASTER));
      return mostRecentKey;
    }

    return keys[0];
  };

  const getKey = (id: string | number, type: string): E2EKey => {
    if (!process.client) {
      console.error(process);
      return;
    }
    const storedData = localStorage.getItem(type);
    if (!storedData) {
      return null;
    }
    let e2eData = JSON.parse(storedData) as E2EKey[];
    return e2eData.find((item) => item.id === id);
  };

  const removeKey = (id: string | number, type: string) => {
    if (!process.client) {
      console.error(process);
      return;
    }
    const storedData = localStorage.getItem(type);
    if (!storedData) {
      console.log("Key not found");
      return;
    }

    let e2eData = JSON.parse(storedData) as E2EKey[];

    e2eData = e2eData.filter((key) => key.id !== id);
    const newData = JSON.stringify(e2eData);

    localStorage.setItem(type, newData);
    console.log("Key removed", e2eData);
  };

  const removeKeys = (type: string) => {
    if (!process.client) {
      console.error(process);
      return;
    }
    console.log("Removing Keys", type);
    localStorage.removeItem(type);
  };

  const getNewKey = async (): Promise<string> => {
    const { error: apiError, data: key } = await useFetch<IRoom>(
      `${config.public.apiBase}/crypto/new-key`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    console.log("New key fetched", key.value);
    return key.value as string;
  };

  const clearOldMasterKeys = async (): Promise<E2EKey[]> => {
    const keys = getKeys(LocalStoreTypes.E2EMASTER);

    if (keys.length < 2) {
      return;
    }

    const mostRecentKey = keys.reduce((a, b) => {
      return new Date(a.id) > new Date(b.id) ? a : b;
    });

    console.log("Removing old Master Keys", keys);
    removeKeys(LocalStoreTypes.E2EMASTER);
    console.log("Saving recent Master Key", mostRecentKey);
    return addKey(mostRecentKey, LocalStoreTypes.E2EMASTER);
  };

  const extractKeys = (): E2EExtract | null => {
    const mk = getMasterKey();
    const rk = getKeys(LocalStoreTypes.E2EROOMS);
    const dmk = getKeys(LocalStoreTypes.E2EDM);

    const result = {} as E2EExtract;
    if (mk) {
      result.masterKey = mk;
    } else {
      result.masterKey = null;
    }
    if (rk.length > 0) {
      result.roomKeys = rk;
    } else {
      result.roomKeys = [];
    }
    if (dmk.length > 0) {
      result.dmKeys = dmk;
    } else {
      result.dmKeys = [];
    }

    if (
      result.masterKey === null &&
      result.roomKeys.length === 0 &&
      result.dmKeys.length === 0
    ) {
      return null;
    }

    return result;
  };

  const uploadKeys = (data: E2EExtract) => {
    const currentKeys = extractKeys();

    if (!currentKeys) {
      addKey(data.masterKey, LocalStoreTypes.E2EMASTER);
      data.dmKeys.forEach((k) => addKey(k, LocalStoreTypes.E2EDM));
      data.roomKeys.forEach((k) => addKey(k, LocalStoreTypes.E2EROOMS));
      return;
    }

    if (data.masterKey) {
      removeKeys(LocalStoreTypes.E2EMASTER);
      addKey(data.masterKey, LocalStoreTypes.E2EMASTER);
    }

    if (data.dmKeys.length > 0) {
      data.dmKeys.forEach((newKey) => {
        if (currentKeys.dmKeys.some((k) => k.id === newKey.id)) {
          return;
        }
        addKey(newKey, LocalStoreTypes.E2EDM);
      });
    }
    if (data.roomKeys.length > 0) {
      data.roomKeys.forEach((newKey) => {
        if (!currentKeys.roomKeys.some((k) => k.id === newKey.id)) {
          return;
        }
        addKey(newKey, LocalStoreTypes.E2EROOMS);
      });
    }
  };

  return {
    updateRoomHasKeyFlag,
    updateDMHasKeyFlag,
    clearUnusedKeys,
    askForMissingKeys,
    syncWithOtherDevice,
    updateHasKeyFlag,
    tryDecryptRoomMessage,
    tryDecryptContactMessage,
    uploadKeys,
    extractKeys,
    getMasterKey,
    clearOldMasterKeys,
    removeKeys,
    tryDecryptContact,
    tryDecryptRoom,
    getMissingKeys,
    getKeys,
    getNewKey,
    encryptMessage,
    decryptMessage,
    getKey,
    removeKey,
    addKey,
  };
};
