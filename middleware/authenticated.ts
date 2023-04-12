export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  console.log("--> Auth middleware triggered", userStore.getIsSignedIn);
  if (userStore.getIsSignedIn) {
    return;
  }
  return navigateTo("/user/login");
});
