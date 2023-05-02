<template>
  <v-container>
    <v-card class="sechat-v-card">
      <!-- Waiting for approval -->
      <!-- <v-card-text
        class="ma-2 pa-02 overflow-auto"
        v-if="webRTCStore.getVideoCallWaitingForApproval"
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
      </v-card-text> -->
      <!-- Want to call someone -->
      <!-- <v-card-text
        class="ma-2 pa-02 overflow-auto"
        v-if="
          !webRTCStore.getVideoCallEstablished &&
          !webRTCStore.getVideoCallRequestSent &&
          !webRTCStore.getVideoCallWaitingForApproval
        "
      >
        <div class="d-flex justify-center">
          <p class="text-h5 text-center">
            Call {{ webRTCStore.getVideoCallContact.displayName }}?
          </p>
        </div>
      </v-card-text> -->
      <!-- Waiting for approval -->
      <!-- <v-card-text
        class="ma-2 pa-02 overflow-auto"
        v-if="
          webRTCStore.videoCallRequestSent &&
          !webRTCStore.getVideoCallEstablished
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
      </v-card-text> -->
      <!-- Video call section -->
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-sheet class="d-flex justify-center video-source-size ma-2">
          <video id="video-stream-local" class="rounded-lg" autoplay></video>
        </v-sheet>
        <div>
          <div class="video-target-size ma-1">
            <video id="video-stream-remote" class="rounded-lg" autoplay></video>
          </div>
          <div class="d-flex justify-center text-center">
            <v-chip size="small">
              {{ webRTCStore.getVideoCallContact.displayName }}
            </v-chip>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn
          @click="endCall"
          size="x-large"
          icon="mdi-phone-hangup"
          color="error"
          variant="outlined"
        ></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          @click="newVideoCall"
          size="x-large"
          icon="mdi-phone"
          color="success"
          variant="outlined"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const videoCall = useVideoCall();
const webRTCStore = useWebRTCStore();

const newVideoCall = async () => {
  if (
    !webRTCStore.getVideoCallWaitingForApproval &&
    !webRTCStore.getVideoCallRequestSent
  ) {
    console.log("--> Initializing call...");
    await videoCall.initializeCall();
    return;
  }
  if (webRTCStore.getVideoCallWaitingForApproval) {
    console.log("--> Approving call...");
    videoCall.approveCall();
    return;
  }
};

const endCall = async () => {
  if (!webRTCStore.getVideoCallWaitingForApproval) {
    videoCall.terminateVideoCall(webRTCStore.getVideoCallContact.displayName);
  } else {
    videoCall.rejectVideoCall(webRTCStore.getVideoCallContact.displayName);
  }
  webRTCStore.cleanup();
  webRTCStore.$reset();
};

onMounted(() => {
  console.warn("--> Video call view Mounted");
  if (!webRTCStore.getVideoCallEstablished) {
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

  // try {
  //   console.warn("--> Video call endCall");
  //   if (signalRStore.getVideoCallContact) {
  //     if (signalRStore.isCallWaitingForApproval) {
  //       videoCall.rejectVideoCall(signalRStore.getVideoCallContact.displayName);
  //     } else {
  //       videoCall.terminateVideoCall(
  //         signalRStore.getVideoCallContact.displayName
  //       );
  //     }
  //   }

  //   signalRStore.clearVideoCallData();
  //   appStore.clearVideoSources();
  // } catch (error) {
  //   console.error(error);
  // }
});
</script>

<style scoped>
.video-target-size > video {
  width: 100%;
}

.video-target-size {
  overflow: hidden;
}

.video-source-size > video {
  width: 25%;
}

.video-source-size {
  overflow: hidden;
}
</style>
