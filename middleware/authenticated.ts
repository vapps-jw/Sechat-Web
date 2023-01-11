export default defineNuxtRouteMiddleware((to, from) => {
  const userData = useUserData();
  const authCookie = useCookie("sechat-id");
  if (userData.userData.value.userId && authCookie) {
    return;
  }
  return navigateTo("/user/login");
});
