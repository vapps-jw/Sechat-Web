import { CookieOptions } from "nuxt/app";
import { CustomCookies } from "~/utilities/globalEnums";

const cookieOptions = () => {
  return {
    maxAge: 100 * 1000000,
    secure: true,
    sameSite: true,
  } as CookieOptions<string>;
};

export const useE2Encryption = () => {
  const addRoomKey = (data: IRoomKey) => {
    const cookie = useCookie(CustomCookies.E2E, cookieOptions());

    if (cookie.value === undefined || !cookie.value) {
      console.log("--> E2E Store Empty");
      const newData = [
        { RoomName: data.roomName, Key: data.key, RoomId: data.roomId },
      ];
      cookie.value = JSON.stringify(newData);
      console.log("--> E2E Updated", newData);
      return;
    }

    const e2eData = JSON.parse(JSON.stringify(cookie.value)) as IRoomKey[];
    console.log("--> E2E Update", e2eData);

    e2eData.push({
      roomName: data.roomName,
      key: data.key,
      roomId: data.roomId,
    });

    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2E Store Data", e2eData);
  };

  const checkE2ECookie = (roomId: string) => {
    const cookie = useCookie(CustomCookies.E2E, cookieOptions());
    if (cookie.value === undefined || !cookie.value) return false;

    const e2eData = JSON.parse(JSON.stringify(cookie.value)) as IRoomKey[];
    return e2eData.some((key) => key.roomId === roomId);
  };

  const removeRoomKey = (roomId: string) => {
    const cookie = useCookie(CustomCookies.E2E, cookieOptions());
    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as IRoomKey[];

    console.log("--> E2E Remove", e2eData);

    e2eData = e2eData.filter((key) => key.roomId !== roomId);
    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2E Updated", e2eData);
  };

  const decryptMessages = (messages: IMessage) => {};

  return {
    checkE2ECookie,
    addRoomKey,
    removeRoomKey,
    decryptMessages,
  };
};
