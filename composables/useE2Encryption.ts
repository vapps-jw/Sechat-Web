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

export const useE2Encryption = () => {
  const addRoomKey = (data: IRoomKey) => {
    let cookie = useCookie(CustomCookies.E2E, cookieOptions());

    if (cookie.value === undefined || !cookie.value) {
      console.log("--> E2E Store Empty");
      const newData = [{ key: data.key, roomId: data.roomId }];
      cookie.value = JSON.stringify(newData);
      console.log("--> E2E Updated", cookie.value);
      return;
    }

    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as IRoomKey[];
    console.log("--> E2E Update", e2eData);

    e2eData = e2eData.filter((key) => key.roomId !== data.roomId);
    e2eData.push({
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

    console.log("--> E2E Cookie taken", cookie);
    if (cookie.value === undefined || !cookie.value) return;

    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as IRoomKey[];

    console.log("--> E2E Remove", e2eData);

    e2eData = e2eData.filter((key) => key.roomId !== roomId);
    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2E Updated", e2eData);
  };

  // Direct Messages

  const checkE2EDMCookie = (contactId: number) => {
    const cookie = useCookie(CustomCookies.E2EDM, cookieOptions());
    if (cookie.value === undefined || !cookie.value) return false;

    const e2eData = JSON.parse(JSON.stringify(cookie.value)) as IContactKey[];
    return e2eData.some((key) => key.contactId === contactId);
  };

  const getE2EDMCookie = (contactId: number) => {
    const cookie = useCookie(CustomCookies.E2EDM, cookieOptions());
    if (cookie.value === undefined || !cookie.value) return null;

    const e2eData = JSON.parse(JSON.stringify(cookie.value)) as IContactKey[];
    return e2eData.find((key) => key.contactId === contactId);
  };

  const addContactKey = (data: IContactKey) => {
    let cookie = useCookie(CustomCookies.E2EDM, cookieOptions());

    if (cookie.value === undefined || !cookie.value) {
      console.log("--> E2EDM Store Empty");
      const newData = [{ key: data.key, contactId: data.contactId }];
      cookie.value = JSON.stringify(newData);
      console.log("--> E2EDM Updated", cookie.value);
      return;
    }

    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as IContactKey[];
    console.log("--> E2EDM Update", e2eData);

    e2eData = e2eData.filter((key) => key.contactId !== data.contactId);
    e2eData.push({
      key: data.key,
      contactId: data.contactId,
    });

    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2EDM Store Data", e2eData);
  };

  const removeContactKey = (contactId: number) => {
    const cookie = useCookie(CustomCookies.E2EDM, cookieOptions());

    console.log("--> E2EDM Cookie taken", cookie);
    if (cookie.value === undefined || !cookie.value) return;

    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as IContactKey[];

    console.log("--> E2EDM Remove", e2eData);

    e2eData = e2eData.filter((key) => key.contactId !== contactId);
    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2EDM Updated", e2eData);
  };

  // Notebooks list

  const checkE2ENotebookCookie = (notebookId: string) => {
    const cookie = useCookie(CustomCookies.E2ENOTEBOOK, cookieOptions());
    if (cookie.value === undefined || !cookie.value) return false;

    const e2eData = JSON.parse(JSON.stringify(cookie.value)) as INotebookKey[];
    return e2eData.some((key) => key.notebookId === notebookId);
  };

  const addNotebookKey = (notebookKey: INotebookKey) => {
    let cookie = useCookie(CustomCookies.E2ENOTEBOOK, cookieOptions());

    if (cookie.value === undefined || !cookie.value) {
      console.log("--> E2ENOTEBOOK Store Empty");
      const newData = [
        { key: notebookKey.key, contactId: notebookKey.notebookId },
      ];
      cookie.value = JSON.stringify(newData);
      console.log("--> E2ENOTEBOOK Updated", cookie.value);
      return;
    }

    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as INotebookKey[];
    console.log("--> E2ENOTEBOOK Update", e2eData);

    e2eData = e2eData.filter(
      (key) => key.notebookId !== notebookKey.notebookId
    );
    e2eData.push({
      key: notebookKey.key,
      notebookId: notebookKey.notebookId,
    });

    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2ENOTEBOOK Store Data", e2eData);
  };

  const removeNotebookKey = (notebookId: string) => {
    const cookie = useCookie(CustomCookies.E2ENOTEBOOK, cookieOptions());

    console.log("--> E2ENOTEBOOK Cookie taken", cookie);
    if (cookie.value === undefined || !cookie.value) return;

    let e2eData = JSON.parse(JSON.stringify(cookie.value)) as INotebookKey[];

    console.log("--> E2ENOTEBOOK Remove", e2eData);

    e2eData = e2eData.filter((key) => key.notebookId !== notebookId);
    cookie.value = JSON.stringify(e2eData);
    console.log("--> E2ENOTEBOOK Updated", e2eData);
  };

  return {
    getE2EDMCookie,
    checkE2ENotebookCookie,
    addNotebookKey,
    removeNotebookKey,
    checkE2EDMCookie,
    addContactKey,
    removeContactKey,
    checkE2ECookie,
    addRoomKey,
    removeRoomKey,
  };
};
