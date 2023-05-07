<template>
  <v-sheet
    class="d-flex justify-center ma-1"
    :class="
      webRTCStore.videoCallEstablished ? 'video-local-size' : 'video-small-size'
    "
  >
    <video id="video-stream-local" class="rounded-lg" autoplay></video>
  </v-sheet>
</template>

<script setup lang="ts">
const webRTCStore = useWebRTCStore();
</script>

<style scoped>
.video-small-size > video {
  width: 50%;
  height: 50%;
}

.video-local-size > video {
  width: 25%;
}

.video-local-size {
  overflow: hidden;
}
</style>
