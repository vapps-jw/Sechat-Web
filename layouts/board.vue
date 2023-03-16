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
          signalR.isOnline.value
        "
        icon="mdi-web-check"
        size="x-large"
        color="success"
      ></v-icon>
      <v-icon
        v-if="
          signalR.connectionState.value === SignalRState.Connecting &&
          signalR.isOnline.value
        "
        icon="mdi-web-sync"
        size="x-large"
        color="warning"
      ></v-icon>
      <v-icon
        v-if="
          signalR.connectionState.value === SignalRState.Disconnected &&
          signalR.isOnline.value
        "
        icon="mdi-web-remove"
        size="x-large"
        color="error"
      ></v-icon>
      <v-icon
        v-if="!signalR.isOnline.value"
        icon="mdi-web-off"
        size="x-large"
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

onMounted(async () => {
  console.warn("--> Chat Layout onMounted");

  await chatApi.getState();
  await signalR.tryReconnect();

  console.info("--> Hooking to visibility change");
  window.addEventListener("visibilitychange", () => {
    signalR.handleVisibilityChange();
  });

  console.info("--> Hooking to online change");
  window.addEventListener("online", () => {
    chatApi.handleOnline();
    signalR.handleOnline();
  });
  window.addEventListener("offline", () => signalR.handleOffline());
});

onBeforeUnmount(() => {
  console.warn("--> Chat Layout onBeforeUnmount");

  signalR.closeConnection();

  console.info("--> Removing Hook to visibility change");
  window.removeEventListener("visibilitychange", () => {
    signalR.handleVisibilityChange();
  });

  console.info("--> Removing Hook to online change");
  window.removeEventListener("online", () => {
    chatApi.handleOnline();
    signalR.handleOnline();
  });
  window.removeEventListener("offline", () => signalR.handleOffline());
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
