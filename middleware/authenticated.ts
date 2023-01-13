export default defineNuxtRouteMiddleware((to, from) => {
  console.log("--> Auth middleware triggered");
  const userData = useUserData();
  if (userData.isSignedIn) {
    return;
  }
  return navigateTo("/user/login");
});
