<template>
  <v-app id="chat-view">
    <v-main class="overflow-hidden">
      <chat-snackbar />
      <chat-loading-overlay :overlay="sechatAppStore.showLoadingOverlay" />
      <slot />
    </v-main>
    <!-- <chat-footer /> -->
  </v-app>
</template>

<script setup lang="ts">
//const lockResolver = ref(null);
const sechatAppStore = useSechatAppStore();
const signalR = useSignalR();
const signalRStore = useSignalRStore();
const chatApi = useChatApi();
const refreshHandler = useRefreshHandler();
const chatStore = useSechatChatStore();
const videoCall = useVideoCall();
const appStore = useSechatAppStore();

onMounted(async () => {
  console.warn("--> Chat Layout onMounted");
  sechatAppStore.updateLoadingOverlay(true);

  console.warn("--> Getting State");
  const chatState = await chatApi.getState();

  chatStore.loadRooms(chatState.rooms);
  chatStore.loadContacts(chatState.userContacts);

  await signalR.connect();

  console.info("--> Hooking to visibility change");
  window.addEventListener(
    "visibilitychange",
    refreshHandler.handleVisibilityChange
  );

  console.info("--> Hooking to online change");
  window.addEventListener("online", refreshHandler.handleOnlineChange);
  window.addEventListener("offline", refreshHandler.handleOfflineChange);

  sechatAppStore.updateLoadingOverlay(false);
});

onBeforeUnmount(() => {
  console.warn("--> Chat Layout onBeforeUnmount");

  if (signalRStore.isVideoCallInProgress) {
    console.error("--> Video Call in Progress -- Terminating");
    videoCall.terminateVideoCall(signalRStore.getVideoCallContact.displayName);

    signalRStore.clearVideoCallData();
    appStore.clearVideoSources();
  }

  signalR.closeConnection();
  signalRStore.$reset();
  chatStore.$reset();

  console.warn("--> Connection", signalRStore.getConnection);

  console.info("--> Removing Hook to visibility change");
  window.removeEventListener(
    "visibilitychange",
    refreshHandler.handleVisibilityChange
  );

  console.info("--> Removing Hook to online change");
  window.removeEventListener("online", refreshHandler.handleOnlineChange);
  window.removeEventListener("offline", refreshHandler.handleOfflineChange);
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
