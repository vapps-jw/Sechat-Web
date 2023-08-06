export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  console.warn("Login Page middleware triggered", userStore.isSignedIn);
  if (userStore.isSignedIn && to.path === "/user/login") {
    return navigateTo("/");
  }
});
