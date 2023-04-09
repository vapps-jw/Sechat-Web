<template>
  <v-app id="chat-view">
    <v-main>
      <chat-snackbar />
      <chat-loading-overlay :overlay="sechatAppStore.showLoadingOverlay" />
      <slot />
    </v-main>
    <chat-footer />
  </v-app>
</template>

<script setup lang="ts">
//const lockResolver = ref(null);
const sechatAppStore = useSechatAppStore();
const sechatApp = useSechatApp();
const signalR = useSignalR();
const chatApi = useChatApi();
const refreshHandler = useRefreshHandler();
const chatStore = useSechatChatStore();

onMounted(async () => {
  console.warn("--> Chat Layout onMounted");
  sechatApp.showLoadingOverlay();

  console.warn("--> Getting State");
  const chatState = await chatApi.getState();

  chatStore.loadRooms(chatState.rooms);
  chatStore.loadConnections(chatState.userConnections);

  await signalR.connect();

  console.info("--> Hooking to visibility change");
  window.addEventListener(
    "visibilitychange",
    refreshHandler.handleVisibilityChange
  );

  console.info("--> Hooking to online change");
  window.addEventListener("online", refreshHandler.handleOnlineChange);
  window.addEventListener("offline", refreshHandler.handleOnlineChange);

  sechatApp.hideLoadingOverlay();
});

onBeforeUnmount(() => {
  console.warn("--> Chat Layout onBeforeUnmount");

  signalR.closeConnection();

  console.info("--> Removing Hook to visibility change");
  window.removeEventListener(
    "visibilitychange",
    refreshHandler.handleVisibilityChange
  );

  console.info("--> Removing Hook to online change");
  window.removeEventListener("online", refreshHandler.handleOnlineChange);
  window.removeEventListener("offline", refreshHandler.handleOnlineChange);
});

// console.info("--> Handling lock");
// if (navigator && navigator.locks && navigator.locks.request) {
//   const promise = new Promise((res) => {
//     lockResolver.value = res;
//   });

//   navigator.locks.request("unique_lock_name", { mode: "shared" }, () => {
//     return promise;
//   });
// }
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
