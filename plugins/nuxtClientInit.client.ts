import { LocalStoreTypes } from "~/utilities/globalEnums";

export default defineNuxtPlugin(async (context) => {
  const disableLogs = () => {
    // console.log = () => {};
    // console.warn = () => {};
    // console.info = () => {};
  };

  console.warn("Client Init Plugin Triggered");
  console.warn("ENV", process.env.NODE_ENV);
  process.env.NODE_ENV === "production" ? disableLogs() : null;

  const app = useSechatApp();
  const appStore = useSechatAppStore();
  const chatApi = useChatApi();
  const userStore = useUserStore();
  const refreshHandler = useRefreshHandler();
  const userApi = useUserApi();

  const gdpr = app.getLocalStoreItem(LocalStoreTypes.GDPR);
  if (gdpr) {
    appStore.GDPR = true;
  } else {
    refreshHandler.signOutCleanup();
    return;
  }

  console.error("Stored Profile", userStore.userProfile);
  const authCheck = await chatApi.isAuthorized();
  console.error("Auth Check", authCheck);
  if (!authCheck) {
    refreshHandler.signOutCleanup();
    return;
  }

  if (authCheck && userStore.isSignedIn) {
    return;
  }

  try {
    console.error("Fetching missing profile");
    userStore.$reset();
    const profile = await userApi.getUserData();
    userStore.updateUserProfile(profile);
  } catch (error) {
    console.error(error);
    refreshHandler.signOutCleanup();
    return;
  }
});
