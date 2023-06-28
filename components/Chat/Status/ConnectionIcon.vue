<template>
  <Icon
    v-if="
      signalRStore.connectionState === SignalRState.Connected &&
      appStore.getOnlineState
    "
    name="svg-spinners:wifi-fade"
    color="#43A047"
  />
  <v-icon
    v-if="
      signalRStore.connectionState === SignalRState.Connecting &&
      appStore.getOnlineState
    "
    icon="mdi-web-sync"
    color="warning"
  ></v-icon>
  <v-icon
    v-if="
      signalRStore.connectionState === SignalRState.Disconnected &&
      appStore.getOnlineState
    "
    icon="mdi-web-remove"
    color="error"
  ></v-icon>
  <v-icon
    v-if="!appStore.getOnlineState"
    icon="mdi-web-off"
    color="error"
  ></v-icon>
</template>

<script setup lang="ts">
import { SignalRState } from "~~/utilities/globalEnums";

const appStore = useSechatAppStore();
const signalRStore = useSignalRStore();
</script>

<style scoped></style>
