<template>
  <!-- Waiting for approval -->
  <v-card-text
    class="ma-2 pa-02 overflow-auto"
    v-if="webRTCStore.videoCallWaitingForApproval"
  >
    <div class="d-flex justify-center">
      <p class="text-h5 text-center">
        {{ webRTCStore.getVideoCallContact.displayName }}
      </p>
    </div>
    <div class="d-flex justify-center mt-15">
      <v-icon
        class="sechat-shaking"
        color="warning"
        size="x-large"
        icon="mdi-phone-incoming"
      ></v-icon>
    </div>
  </v-card-text>
  <!-- Want to call someone -->
  <v-card-text
    class="ma-2 pa-02 overflow-auto"
    v-else-if="
      !webRTCStore.videoCallEstablished &&
      !webRTCStore.videoCallRequestSent &&
      !webRTCStore.videoCallWaitingForApproval
    "
  >
    <div class="d-flex justify-center">
      <p class="text-h5 text-center">
        Call {{ webRTCStore.getVideoCallContact.displayName }}?
      </p>
    </div>
  </v-card-text>
  <!-- Request sent -->
  <v-card-text
    class="ma-2 pa-02 overflow-auto"
    v-else-if="
      webRTCStore.videoCallRequestSent && !webRTCStore.videoCallEstablished
    "
  >
    <div class="d-flex justify-center">
      <p class="text-h5 text-center">
        Calling {{ webRTCStore.getVideoCallContact.displayName }}
      </p>
    </div>
    <div class="d-flex justify-center mt-15">
      <v-icon
        class="sechat-shaking"
        color="warning"
        size="x-large"
        icon="mdi-phone-incoming-outgoing"
      ></v-icon>
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
const webRTCStore = useWebRTCStore();
</script>

<style scoped></style>
