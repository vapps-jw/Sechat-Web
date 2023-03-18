<template>
  <v-app id="chat-view">
    <v-main>
      <chat-snackbar />
      <chat-loading-overlay :overlay="appStore.loadingOverlayVisible.value" />
      <slot />
    </v-main>
    <v-footer class="d-flex flex-row justify-center">
      <v-icon
        v-if="
          signalR.connectionState.value === SignalRState.Connected &&
          appStore.isOnline.value
        "
        icon="mdi-web-check"
        size="small"
        color="success"
      ></v-icon>
      <v-icon
        v-if="
          signalR.connectionState.value === SignalRState.Connecting &&
          appStore.isOnline.value
        "
        icon="mdi-web-sync"
        size="small"
        color="warning"
      ></v-icon>
      <v-icon
        v-if="
          signalR.connectionState.value === SignalRState.Disconnected &&
          appStore.isOnline.value
        "
        icon="mdi-web-remove"
        size="small"
        color="error"
      ></v-icon>
      <v-icon
        v-if="!appStore.isOnline.value"
        icon="mdi-web-off"
        size="small"
        color="grey-lighten-1"
      ></v-icon>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { SignalRState } from "~~/utilities/globalEnums";

//const lockResolver = ref(null);
const appStore = useAppStore();
const signalR = useSignalR();
const chatApi = useChatApi();
const refreshHandler = useRefreshHandler();
const chatStore = useChatStore();

onMounted(async () => {
  console.warn("--> Chat Layout onMounted");
  appStore.showLoadingOverlay();

  const chatState = await chatApi.getState();

  chatStore.loadRooms(chatState.rooms);
  chatStore.loadUserConnections(chatState.userConnections);

  await signalR.connect();

  console.info("--> Hooking to visibility change");
  window.addEventListener("visibilitychange", () => {
    refreshHandler.handleVisibilityChange();
  });

  console.info("--> Hooking to online change");
  window.addEventListener("online", () => refreshHandler.handleOnlineChange());
  window.addEventListener("offline", () => refreshHandler.handleOnlineChange());

  appStore.hideLoadingOverlay();
});

onBeforeUnmount(() => {
  console.warn("--> Chat Layout onBeforeUnmount");

  signalR.closeConnection();

  console.info("--> Removing Hook to visibility change");
  window.removeEventListener("visibilitychange", () =>
    refreshHandler.handleVisibilityChange()
  );

  console.info("--> Removing Hook to online change");
  window.removeEventListener("online", () =>
    refreshHandler.handleOnlineChange()
  );
  window.removeEventListener("offline", () =>
    refreshHandler.handleOnlineChange()
  );
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
