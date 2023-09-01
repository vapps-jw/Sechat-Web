<template>
  <v-banner lines="one" color="warning">
    <template v-slot:text> {{ signalRStore.connectionState }} </template>
    <template v-slot:prepend>
      <div class="d-flex align-center">
        <Icon
          v-if="signalRStore.connectionState !== SignalRState.Connected"
          name="svg-spinners:bars-scale"
        />
        <v-icon v-else icon="mdi-web-check" color="success"></v-icon>
      </div>
    </template>
  </v-banner>
</template>

<script setup lang="ts">
import { SignalRState } from "~~/utilities/globalEnums";
const signalRStore = useSignalRStore();
</script>

<style scoped></style>
