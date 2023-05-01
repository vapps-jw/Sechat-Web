export default defineNuxtRouteMiddleware((to, from) => {
  console.warn("--> Signal R Middleware", to, from);

  // const signalRStore = useSignalRStore();
  // const videoCall = useVideoCall();

  // if (to.name === "chat") {
  //   console.warn("--> Signal R Middleware Connecting");
  // }

  // if (from.name === "chat" && signalRStore.getVideoCallInProgress) {
  //   console.error("--> Video Call in Progress returning");
  //   videoCall.terminateVideoCall(signalRStore.getVideoCallContact.displayName);
  //   return navigateTo("/chat");
  // }
});
