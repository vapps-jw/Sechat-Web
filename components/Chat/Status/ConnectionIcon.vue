<template>
  <div>
    <v-icon
      v-if="signalRStore.connectionState === SignalRState.Connected"
      icon="mdi-web-check"
      size="small"
      color="success"
    ></v-icon>
    <v-icon
      v-if="
        signalRStore.connectionState === SignalRState.Connecting &&
        appStore.getOnlineState
      "
      icon="mdi-web-sync"
      size="small"
      color="warning"
    ></v-icon>
    <v-icon
      v-if="
        signalRStore.connectionState === SignalRState.Disconnected &&
        appStore.getOnlineState
      "
      icon="mdi-web-remove"
      size="small"
      color="error"
    ></v-icon>
    <v-icon
      v-if="!appStore.getOnlineState"
      icon="mdi-web-off"
      size="small"
      color="grey-lighten-1"
    ></v-icon>
  </div>
</template>

<script setup lang="ts">
import { SignalRState } from "~~/utilities/globalEnums";

const appStore = useSechatAppStore();
const signalRStore = useSignalRStore();
</script>

<style scoped></style>
