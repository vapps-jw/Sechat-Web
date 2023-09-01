<template>
  <v-app id="chat-view">
    <v-main class="overflow-hidden sechat-layout">
      <chat-status-connection-banner
        class="banner-style"
        :connection-state="signalRStore.connectionState"
        v-if="
          !signalRStore.connection ||
          (signalRStore.connection &&
            signalRStore.connectionState !== HubConnectionState.Connected)
        "
      />
      <chat-snackbar />
      <chat-loading-overlay :overlay="sechatAppStore.showLoadingOverlay" />
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";
import { HubConnectionState } from "@microsoft/signalr";

const sechatAppStore = useSechatAppStore();
const appStore = useSechatAppStore();
const signalRStore = useSignalRStore();
const refreshHandler = useRefreshHandler();
const chatStore = useSechatChatStore();
const webRTCStore = useWebRTCStore();
const I18n = useI18n();
const theme = useTheme();
const settings = useSettingsStore();

const { connection } = storeToRefs(signalRStore);
watch(
  connection,
  async (newVal, oldVal) => {
    signalRStore.updateConnectionState();
    console.warn("Connection State update", newVal?.state, oldVal?.state);
  },
  { deep: true }
);

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
  console.warn("Chat Layout onMounted", settings.settings.theme);
  if (settings.settings.theme) {
    theme.global.name.value = settings.settings.theme;
  }
  await refreshHandler.handleOnMountedLoad();

  appStore.updateLocalLanguage(I18n.locale.value);
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
  await resetSechat();

  console.info("Removing Hook to window events");
  window.removeEventListener(
    "visibilitychange",
    refreshHandler.handleVisibilityChange
  );
  window.removeEventListener("online", refreshHandler.handleOnlineChange);
  window.removeEventListener("offline", refreshHandler.handleOfflineChange);
  window.removeEventListener("beforeunload", resetSechat);
});
</script>
<style scoped>
html {
  font-family: "Ubuntu";
}
.banner-style {
  position: absolute;
  z-index: 999;
}
</style>
