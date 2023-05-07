<template>
  <v-card class="sechat-v-card ma-0">
    <v-card-text
      class="ma-2 pa-02 overflow-auto"
      v-if="!webRTCStore.videoCallEstablished"
    >
      <chat-video-call-info />
    </v-card-text>
    <v-card-text class="ma-0 pa-0 overflow-hidden">
      <chat-video-call-local-player />
      <chat-video-call-remote-player />
    </v-card-text>
    <v-card-actions
      class="ma-0"
      :class="!webRTCStore.videoCallEstablished ? '' : 'd-flex justify-center'"
    >
      <chat-video-call-controls />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
const webRTCStore = useWebRTCStore();

onMounted(() => {
  console.warn("--> Video call view Mounted");
  if (!webRTCStore.videoCallEstablished) {
    webRTCStore.updateRemoteVideoPlayer(
      <HTMLVideoElement>document.getElementById("video-stream-remote")
    );
    webRTCStore.updateLocalVideoPlayer(
      <HTMLVideoElement>document.getElementById("video-stream-local")
    );
  }
});

onBeforeUnmount(() => {
  console.warn("--> Video call onBeforeUnmount");
  webRTCStore.cleanup();
  webRTCStore.$reset();
});
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

.video-small-size > video {
  width: 50%;
  height: 50%;
}

.video-remote-size {
  overflow: hidden;
}

.video-local-size > video {
  width: 25%;
}

.video-local-size {
  overflow: hidden;
}
</style>
