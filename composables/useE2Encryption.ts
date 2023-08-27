import CryptoES from "crypto-es";
import { E2EStatusMessages } from "~~/utilities/e2eEnums";
import { LocalStoreTypes } from "~~/utilities/globalEnums";

export const useE2Encryption = () => {
  const config = useRuntimeConfig();
  const sechatStore = useSechatChatStore();
  const userStore = useUserStore();

  const getMissingKeys = (): MissingKey[] => {
    const missingContactKeys = sechatStore.availableContacts.filter(
      (c) => !c.hasKey
    );
    const missingRoomKeys = sechatStore.availableRooms.filter((c) => !c.hasKey);

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
      sechatStore.updateContact(cr);
      return;
    }
    console.warn("Decrypting Contact", cr, key);
    cr.hasKey = true;
    cr.directMessages?.forEach((dm) => {
      if (dm.decrypted) {
        return;
      }
      const decrypted = decryptMessage(dm.text, key);
      if (decrypted === E2EStatusMessages.DECRYPTION_ERROR) {
        dm.error = true;
      }
      dm.text = decrypted;
      dm.decrypted = true;
    });
    sechatStore.updateContact(cr);
  };

  const tryDecryptRoom = (room: IRoom) => {
    const key = getKey(room.id, LocalStoreTypes.E2EROOMS);

    if (!key) {
      console.warn("Room Key not found", room);
      room.hasKey = false;
      room.messages?.forEach((dm) => (dm.decrypted = false));
      sechatStore.replaceRoom(room);
      return;
    }
    console.warn("Decrypting Room", room, key);
    room.hasKey = true;
    room.messages?.forEach((message) => {
      const decrypted = decryptMessage(message.text, key);
      if (decrypted === E2EStatusMessages.DECRYPTION_ERROR) {
        message.error = true;
      }
      message.text = decrypted;
      message.decrypted = true;
    });
    sechatStore.replaceRoom(room);
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
      return;
    }

    const storedData = localStorage.getItem(type);
    if (!storedData) {
      return <E2EKey[]>[];
    }

    return JSON.parse(storedData) as E2EKey[];
  };

  const getMasterKey = (): E2EKey => {
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

  return {
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
