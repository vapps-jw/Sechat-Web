<template>
  <v-sheet class="d-flex justify-center video-remote-size ma-1">
    <video
      id="video-stream-remote"
      autoplay
      class="rounded-lg"
      :class="webRTCStore.videoCallEstablished ? '' : 'sechat-hidden'"
    ></video>
  </v-sheet>
</template>

<script setup lang="ts">
const webRTCStore = useWebRTCStore();
</script>

<style scoped>
.video-remote-size > video {
  width: 75%;
  height: 75%;
  max-height: 75%;
}

.video-remote-size {
  overflow: hidden;
}

.video-remote-size {
  overflow: hidden;
}
</style>
