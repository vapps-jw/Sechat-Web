<template>
  <v-footer class="d-flex flex-row justify-center h-5">
    <v-chip color="warning">
      {{ config.public.appVersion }}
    </v-chip>
    <v-spacer></v-spacer>
    <v-icon
      v-if="connectionState === SignalRState.Connected && appStore.isOnline"
      icon="mdi-web-check"
      size="small"
      color="success"
    ></v-icon>
    <v-icon
      v-if="connectionState === SignalRState.Connecting && appStore.isOnline"
      icon="mdi-web-sync"
      size="small"
      color="warning"
    ></v-icon>
    <v-icon
      v-if="connectionState === SignalRState.Disconnected && appStore.isOnline"
      icon="mdi-web-remove"
      size="small"
      color="error"
    ></v-icon>
    <v-icon
      v-if="!appStore.isOnline"
      icon="mdi-web-off"
      size="small"
      color="grey-lighten-1"
    ></v-icon>
  </v-footer>
</template>

<script setup lang="ts">
import { SignalRState } from "~~/utilities/globalEnums";
import { HubConnectionState } from "@microsoft/signalr";

const appStore = useSechatAppStore();
const signalR = useSignalR();
const config = useRuntimeConfig();

const connectionState = computed<string>(() => {
  if (!signalR.connection.value) {
    return SignalRState.Disconnected;
  }
  if (signalR.connection.value.state === HubConnectionState.Connected) {
    return SignalRState.Connected;
  }
  if (
    signalR.connection.value.state === HubConnectionState.Connecting ||
    signalR.connection.value.state === HubConnectionState.Reconnecting
  ) {
    return SignalRState.Connecting;
  }
  return SignalRState.Disconnected;
});
</script>

<style scoped></style>
