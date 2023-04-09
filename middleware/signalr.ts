export default defineNuxtRouteMiddleware((to, from) => {
  console.warn("--> Signal R Middleware", to, from);

  if (to.name === "chat") {
    console.warn("--> Signal R Middleware Connecting");
  }

  if (from.name === "chat") {
    console.warn("--> Signal R Middleware Disconnecting");
  }
});
