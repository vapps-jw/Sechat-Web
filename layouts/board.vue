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

const lockResolver = ref(null);
const appStore = useAppStore();
const signalR = useSignalR();
const chatApi = useChatApi();

onMounted(async () => {
  console.warn("--> App onMounted");

  console.info("--> Hooking to visibilitychange");
  window.addEventListener("visibilitychange", () => {
    signalR.handleVisibilityChange();
    chatApi.getState();
  });
});

onBeforeUnmount(() => {
  console.warn("--> App onBeforeUnmount");
  window.removeEventListener("visibilitychange", () => {
    signalR.handleVisibilityChange();
    chatApi.getState();
  });
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
