<template>
  <v-app id="chat-view">
    <v-main>
      <chat-snackbar />
      <chat-loading-overlay :overlay="appStore.loadingOverlayVisible.value" />
      <slot />
    </v-main>
    <v-footer class="d-flex flex-row justify-center">
      <v-icon
        v-if="signalR.connectionState.value === SignalRState.Connected"
        icon="mdi-web-check"
        size="x-large"
        color="success"
      ></v-icon>
      <v-icon
        v-if="signalR.connectionState.value === SignalRState.Connecting"
        icon="mdi-web-sync"
        size="x-large"
        color="warning"
      ></v-icon>
      <v-icon
        v-if="signalR.connectionState.value === SignalRState.Disconnected"
        icon="mdi-web-off"
        size="x-large"
        color="error"
      ></v-icon>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { SignalRState } from "~~/utilities/globalEnums";

const lockResolver = ref(null);
const appStore = useAppStore();
const signalR = useSignalR();

onMounted(async () => {
  console.warn("--> App onMounted");

  console.info("--> Hooking to visibilitychange");
  window.addEventListener("visibilitychange", () =>
    signalR.handleVisibilityChange()
  );

  console.info("--> Handling lock");
  if (navigator && navigator.locks && navigator.locks.request) {
    const promise = new Promise((res) => {
      lockResolver.value = res;
    });

    navigator.locks.request("unique_lock_name", { mode: "shared" }, () => {
      return promise;
    });
  }
});

onBeforeUnmount(() => {
  console.warn("--> App onBeforeUnmount");
  window.removeEventListener("visibilitychange", () =>
    signalR.handleVisibilityChange()
  );
});
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
