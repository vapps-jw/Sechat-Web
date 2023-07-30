import CryptoES from "crypto-es";

export const useE2Encryption = () => {
  const config = useRuntimeConfig();

  const encryptMessage = (data: string, key: e2eKey): string => {
    try {
      var result = CryptoES.AES.encrypt(data, key.key).toString();
      console.log("Encryption result", result);
      return result;
    } catch (error) {
      console.error(error);
      return "Encryption Failed";
    }
  };
  const decryptMessage = (data: string, key: e2eKey): string => {
    try {
      var result = CryptoES.enc.Utf8.stringify(
        CryptoES.AES.decrypt(data, key.key)
      );
      console.log("Decryption result", result);
      return result;
    } catch (error) {
      console.error(error);
      return "Decryption Failed";
    }
  };

  const addKey = (data: e2eKey, type: string): e2eKey[] => {
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

    let e2eData = JSON.parse(storedData) as e2eKey[];
    console.log("Casted data", e2eData);

    e2eData = e2eData.filter((key) => key.id !== data.id);
    e2eData.push({
      key: data.key,
      id: data.id,
    });
    console.log("Updated data", e2eData);

    const newData = JSON.stringify(e2eData);
    localStorage.setItem(type, newData);
    return e2eData;
  };

  const getKeys = (type: string): null | e2eKey[] => {
    if (!process.client) {
      console.error(process);
      return;
    }

    const storedData = localStorage.getItem(type);
    if (!storedData) {
      return null;
    }

    return JSON.parse(storedData) as e2eKey[];
  };

  const getKey = (id: string | number, type: string): e2eKey => {
    if (!process.client) {
      console.error(process);
      return;
    }
    const storedData = localStorage.getItem(type);
    if (!storedData) {
      return null;
    }
    let e2eData = JSON.parse(storedData) as e2eKey[];
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

    let e2eData = JSON.parse(storedData) as e2eKey[];

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
    getKeys,
    getNewKey,
    encryptMessage,
    decryptMessage,
    getKey,
    removeKey,
    addKey,
  };
};
