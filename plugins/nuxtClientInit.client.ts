import {
  LocalStoreTypes,
  ServiceWorkerMessages,
} from "~/utilities/globalEnums";

export default defineNuxtPlugin(async (context) => {
  const disableLogs = () => {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
  };

  console.warn("Client Init Plugin Triggered");
  console.warn("ENV", process.env.NODE_ENV);
  process.env.NODE_ENV === "production" ? disableLogs() : null;

  const app = useSechatApp();
  const appStore = useSechatAppStore();
  const userStore = useUserStore();
  const refreshHandler = useRefreshHandler();
  const userApi = useUserApi();
  const e2e = useE2Encryption();

  e2e.clearOldMasterKeys();
  const keys = e2e.getKeys(LocalStoreTypes.E2EMASTER);
  if (keys.length > 0) {
    const msg: ServiceWorkerMessage = {
      title: ServiceWorkerMessages.MasterKey,
      value: keys[0],
    };
    await navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage(msg);
    });
  }

  const gdpr = app.getLocalStoreItem(LocalStoreTypes.GDPR);
  if (gdpr) {
    appStore.GDPR = true;
  } else {
    refreshHandler.signOutCleanup();
    return;
  }

  if (userStore.isSignedIn) {
    return;
  }

  try {
    console.warn("Fetching missing profile");
    userStore.$reset();
    const profile = await userApi.getUserData();
    userStore.updateUserProfile(profile);
    console.warn("Profile", profile);
  } catch (error) {
    console.error(error);
    refreshHandler.signOutCleanup();
    return;
  }
});
