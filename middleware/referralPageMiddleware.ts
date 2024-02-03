export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  console.warn("Referral Page middleware triggered", userStore.isSignedIn);

  if (userStore.canAccessChat) {
    return navigateTo("/");
  }
});
