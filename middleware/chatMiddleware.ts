import { CustomCookies } from "~/utilities/globalEnums";

export default defineNuxtRouteMiddleware((to, from) => {
  console.warn("Chat middleware triggered");
  const gdprCookie = useCookie(CustomCookies.GDPR);
  console.warn("GDPR Cookie", gdprCookie, gdprCookie.value);
  if (gdprCookie.value === undefined) {
    return navigateTo("/");
  }
});
