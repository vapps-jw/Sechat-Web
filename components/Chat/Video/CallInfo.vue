<template>
  <!-- Waiting for approval -->
  <div
    v-if="
      webRTCStore.videoCallWaitingForApproval &&
      !webRTCStore.videoCallEstablished
    "
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
  </div>
  <!-- Want to call someone -->
  <div
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
  </div>
  <!-- Request sent -->
  <div
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
  </div>
</template>

<script setup lang="ts">
const webRTCStore = useWebRTCStore();
</script>

<style scoped></style>
