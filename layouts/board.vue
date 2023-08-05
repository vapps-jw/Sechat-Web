<template>
  <v-app id="chat-view">
    <v-main class="overflow-hidden sechat-layout">
      <chat-snackbar />
      <chat-loading-overlay :overlay="sechatAppStore.showLoadingOverlay" />
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const sechatAppStore = useSechatAppStore();
const appStore = useSechatAppStore();
const signalRStore = useSignalRStore();
const refreshHandler = useRefreshHandler();
const chatStore = useSechatChatStore();
const webRTCStore = useWebRTCStore();

const resetSechat = async () => {
  await signalRStore.closeConnection();
  console.warn("Resetting chatStore");
  chatStore.$reset();
  console.warn("Resetting signalRStore");
  signalRStore.$reset();
  console.warn("Resetting webRTCStore");
  webRTCStore.$reset();
};

onMounted(async () => {
  console.warn("Chat Layout onMounted");
  appStore.updateLocalLanguage();
  await refreshHandler.handleOnMountedLoad();

  console.info("Hooking to window events");
  window.addEventListener(
    "visibilitychange",
    refreshHandler.handleVisibilityChange
  );
  window.addEventListener("beforeunload", resetSechat);
  window.addEventListener("online", refreshHandler.handleOnlineChange);
  window.addEventListener("offline", refreshHandler.handleOfflineChange);
});

onBeforeUnmount(async () => {
  console.warn("Chat Layout onBeforeUnmount");
  appStore.updateLoadingOverlay(true);

  await resetSechat();

  console.info("Removing Hook to window events");
  window.removeEventListener(
    "visibilitychange",
    refreshHandler.handleVisibilityChange
  );
  window.removeEventListener("online", refreshHandler.handleOnlineChange);
  window.removeEventListener("offline", refreshHandler.handleOfflineChange);
  window.removeEventListener("beforeunload", resetSechat);
  window.location.reload();
  appStore.updateLoadingOverlay(false);
});
</script>
