import { LocalStoreTypes } from "~/utilities/globalEnums";

export const useE2Encryption = () => {
  const config = useRuntimeConfig();

  const encryptMessage = (data: string, key: e2eKey) => {};
  const decryptMessage = (data: string, key: e2eKey) => {};

  const addKey = (data: e2eKey, type: string) => {
    if (!process.client) {
      return;
    }
    const newData = JSON.stringify([{ key: data.key, id: data.id }]);
    localStorage.setItem(type, newData);
  };

  const getKey = (id: string | number, type: string): e2eKey => {
    if (!process.client) {
      return;
    }
    const storedData = localStorage.getItem(type);
    let e2eData = JSON.parse(JSON.stringify(storedData)) as e2eKey[];
    return e2eData.find((item) => item.id === id);
  };

  const removeKey = (id: string | number, type: string) => {
    if (!process.client) {
      return;
    }
    const storedData = localStorage.getItem(type);
    let e2eData = JSON.parse(JSON.stringify(storedData)) as e2eKey[];

    e2eData = e2eData.filter((key) => key.id !== id);
    const newData = JSON.stringify(e2eData);

    localStorage.setItem(type, newData);
  };

  const getNewKey = async (): Promise<string> => {
    console.log("Getting Rooms from API");
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
    getNewKey,
    encryptMessage,
    decryptMessage,
    getKey,
    removeKey,
    addKey,
  };
};
