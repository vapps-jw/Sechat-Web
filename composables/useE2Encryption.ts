import { CustomCookies } from "~/utilities/globalEnums";

export const useE2Encryption = () => {
  const addRoomKey = (data: IRoomKey) => {
    const cookie = useCookie(CustomCookies.RoomKeys, {
      maxAge: 100 * 1000000,
    });

    if (cookie.value === undefined || !cookie.value) {
      console.log("--> Cookie Empty");
      const newData = {
        keys: [{ roomName: data.roomName, key: data.key, roomId: "" }],
      };
      cookie.value = JSON.stringify(newData);
      return;
    }

    let cookieData = JSON.parse(JSON.stringify(cookie.value)) as IRoomData;
    cookieData.keys.push({
      roomName: data.roomName,
      key: data.key,
      roomId: "",
    });
    cookie.value = JSON.stringify(cookieData);
    console.log("--> Cookie Data", cookieData);
  };

  const removeRoomKey = (roomId: string) => {
    const cookie = useCookie(CustomCookies.RoomKeys, {
      maxAge: 100 * 1000000,
    });
    let cookieData = JSON.parse(JSON.stringify(cookie.value)) as IRoomData;
    cookieData.keys = cookieData.keys.filter((key) => key.roomId !== roomId);
    console.log("--> Cookie Data", cookieData);
    cookie.value = JSON.stringify(cookieData);
  };

  const updateRoomId = (roomName: string, roomId: string) => {
    const cookie = useCookie(CustomCookies.RoomKeys, {
      maxAge: 100 * 1000000,
    });

    let cookieData = JSON.parse(JSON.stringify(cookie.value)) as IRoomData;
    const toBeModified = cookieData.keys.find(
      (r) => r.roomName === roomName && r.roomId === ""
    );
    toBeModified.roomId = roomId;
    console.log("--> Cookie Data", cookieData);
    cookie.value = JSON.stringify(cookieData);
  };

  return { addRoomKey, removeRoomKey, updateRoomId };
};

// interface IRoomData {
//   keys: IRoomKey[];
// }

// interface IRoomKey {
//   roomName?: string;
//   roomId?: string;
//   key?: string;
// }
