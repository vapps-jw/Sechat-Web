import { CookieOptions } from "nuxt/app";
import { CustomCookies } from "~/utilities/globalEnums";

const cookieOptions = () => {
  const config = useRuntimeConfig();

  return {
    maxAge: 600 * 24 * 60 * 60,
    secure: true,
    sameSite: true,
    domain: config.public.mainDomain,
  } as CookieOptions<string>;
};

type e2eKey = {
  id: number | string;
  key: string;
};

export const useE2Encryption = () => {
  const addKey = (data: e2eKey, cookieType: string) => {
    let cookie = useCookie(cookieType, cookieOptions());

    if (cookie.value === undefined || !cookie.value) {
      console.log("--> E2E Store Empty");
      const newData = [{ key: data.key, id: data.id }];
      cookie.value = JSON.stringify(newData);
      console.log("--> E2E Updated", cookie.value);
      return;
    }

    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as e2eKey[];
    console.log("--> E2E Update", e2eData);

    e2eData = e2eData.filter((key) => key.id !== data.id);
    e2eData.push({
      key: data.key,
      id: data.id,
    });

    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2E Store Data", e2eData);
  };

  const checkCookie = (id: string | number, cookieType: string) => {
    const cookie = useCookie(cookieType, cookieOptions());
    if (cookie.value === undefined || !cookie.value) return false;

    const e2eData = JSON.parse(JSON.stringify(cookie.value)) as e2eKey[];
    return e2eData.some((key) => key.id === id);
  };

  const removeKey = (id: string | number, cookieType: string) => {
    const cookie = useCookie(cookieType, cookieOptions());

    console.log("--> E2E Cookie taken", cookie);
    if (cookie.value === undefined || !cookie.value) return;

    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as e2eKey[];

    console.log("--> E2E Remove", e2eData);

    e2eData = e2eData.filter((key) => key.id !== id);
    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2E Updated", e2eData);
  };

  const getCookie = (id: string | number, cookieType: string) => {
    const cookie = useCookie(cookieType, cookieOptions());
    if (cookie.value === undefined || !cookie.value) return null;

    const e2eData = JSON.parse(JSON.stringify(cookie.value)) as e2eKey[];
    return e2eData.find((key) => key.id === id);
  };

  return {
    getCookie,
    checkCookie,
    removeKey,
    addKey,
  };
};
