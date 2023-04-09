export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  console.log("--> Auth middleware triggered", userStore.isSignedIn);
  if (userStore.isSignedIn) {
    return;
  }
  return navigateTo("/user/login");
});
