import { LocalStoreTypes } from "~/utilities/globalEnums";

export default defineNuxtRouteMiddleware((to, from) => {
  console.warn("Chat middleware triggered");
  const app = useSechatApp();
  const gdpr = app.getLocalStoreItem(LocalStoreTypes.GDPR);
  console.warn("GDPR", gdpr);
  if (!gdpr) {
    return navigateTo("/");
  }
});
