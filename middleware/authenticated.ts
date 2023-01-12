export default defineNuxtRouteMiddleware((to, from) => {
  const userData = useUserData();
  if (userData.isSignedIn) {
    return;
  }
  return navigateTo("/user/login");
});
