<template>
  <v-footer class="d-flex flex-row justify-center h-5">
    <v-chip color="warning">
      {{ config.public.appVersion }}
    </v-chip>
    <v-spacer></v-spacer>
  </v-footer>
</template>

<script setup lang="ts">
import { SignalRState } from "~~/utilities/globalEnums";

const appStore = useSechatAppStore();
const config = useRuntimeConfig();
const signalRStore = useSignalRStore();
</script>

<style scoped></style>
