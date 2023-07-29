<template>
  <div>
    <div v-if="!webRTCStore.videoCallEstablished" class="call-info-container">
      <chat-video-call-info />
    </div>

    <div class="videos-container">
      <video
        id="video-stream-local"
        autoplay
        :class="
          webRTCStore.videoCallEstablished ? 'smallFrame' : 'video-player'
        "
      ></video>

      <video
        id="video-stream-remote"
        autoplay
        :class="
          webRTCStore.videoCallEstablished ? 'video-player' : 'sechat-hidden'
        "
      ></video>
    </div>

    <div class="control-container">
      <chat-video-call-controls />
    </div>
  </div>
</template>

<script setup lang="ts">
const webRTCStore = useWebRTCStore();

onMounted(() => {
  console.warn("Video call view Mounted");
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
  console.warn("Video call onBeforeUnmount");
  webRTCStore.cleanup();
  webRTCStore.$reset();
});
</script>

<style scoped>
.smallFrame {
  position: fixed;
  top: 20px;
  left: 20px;
  height: 100px;
  width: 100px;
  border-radius: 5px;
  -webkit-box-shadow: 3px 3px 15px -1px rgba(0, 0, 0, 0.77);
  box-shadow: 3px 3px 15px -1px rgba(0, 0, 0, 0.77);
  z-index: 999;
}

.video-player {
  background-color: black;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.call-info-container {
  width: 80%;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
}
.videos-container {
  display: grid;
  grid-template-columns: 1fr;
  height: 100vh;
  overflow: hidden;
}
.control-container {
  width: 80%;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
