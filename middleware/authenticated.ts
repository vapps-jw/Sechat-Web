export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  console.warn("Auth middleware triggered", userStore.isSignedIn);
  if (userStore.isSignedIn) {
    return;
  }
  return navigateTo("/user/login");
});
