import { LocalStoreTypes } from "~/utilities/globalEnums";

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
  const chatApi = useChatApi();
  const userStore = useUserStore();
  const refreshHandler = useRefreshHandler();
  const userApi = useUserApi();

  const gdpr = app.getLocalStoreItem(LocalStoreTypes.GDPR);
  if (gdpr) {
    appStore.GDPR = true;
  } else {
    return;
  }

  const authCheck = await chatApi.isAuthorized();
  if (!authCheck) {
    console.error("Auth Check Failed");
    console.error("Stored Profile", userStore.userProfile);
    refreshHandler.signOutCleanup();
    return;
  }

  try {
    await userApi.getUserData();
  } catch (error) {
    console.error(error);
  }
});
