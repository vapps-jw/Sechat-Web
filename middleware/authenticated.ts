export default defineNuxtRouteMiddleware((to, from) => {
  const userData = useUserData();
  console.log("--> Auth middleware triggered", userData.isSignedIn.value);
  if (userData.isSignedIn.value) {
    return;
  }
  return navigateTo("/user/login");
});
