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
      console.log(E2EStatusMessages.ENCRYPTION_ERROR, result);
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
    console.log("Stored keys", storedData);
    if (!storedData) {
      const newData = JSON.stringify([{ key: data.key, id: data.id }]);
      console.log("Adding first key");
      localStorage.setItem(type, newData);
      return;
    }

    let e2eData = JSON.parse(storedData) as E2EKey[];
    console.log("Casted data", e2eData);

    e2eData = e2eData.filter((key) => key.id !== data.id);
    e2eData.push({
      key: data.key,
      id: data.id,
    });
    const newData = JSON.stringify(e2eData);
    localStorage.setItem(type, newData);
    return e2eData;
  };

  const getKeys = (type: string): null | E2EKey[] => {
    if (!process.client) {
      console.error(process);
      return;
    }

    const storedData = localStorage.getItem(type);
    if (!storedData) {
      return null;
    }

    return JSON.parse(storedData) as E2EKey[];
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

  return {
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
