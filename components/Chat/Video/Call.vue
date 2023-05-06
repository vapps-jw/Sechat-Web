<template>
  <v-container>
    <v-card class="sechat-v-card">
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
        v-if="
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
      <!-- Waiting for approval -->
      <v-card-text
        class="ma-2 pa-02 overflow-auto"
        v-if="
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
      <!-- Video call section -->
      <v-card-text class="ma-0 pa-0 overflow-hidden">
        <v-sheet
          class="d-flex justify-center ma-1"
          :class="
            webRTCStore.videoCallEstablished
              ? 'video-local-size'
              : 'video-small-size'
          "
        >
          <video id="video-stream-local" class="rounded-lg" autoplay></video>
        </v-sheet>

        <v-sheet class="d-flex justify-center video-remote-size ma-1">
          <video
            id="video-stream-remote"
            autoplay
            class="rounded-lg"
            :class="webRTCStore.videoCallEstablished ? '' : 'sechat-hidden'"
          ></video>
        </v-sheet>
      </v-card-text>
      <chat-video-call-controls />
    </v-card>
  </v-container>
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
