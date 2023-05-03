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
        <v-sheet class="d-flex justify-center ma-1 video-source-size">
          <video id="video-stream-local" class="rounded-lg" autoplay></video>
        </v-sheet>

        <v-sheet class="d-flex justify-center video-target-size ma-1">
          <video
            id="video-stream-remote"
            autoplay
            class="rounded-lg"
            :class="webRTCStore.videoCallEstablished ? '' : 'sechat-hidden'"
          ></video>
        </v-sheet>
        <!-- <div
            v-if="webRTCStore.videoCallEstablished"
            class="d-flex justify-center text-center"
          >
            <v-chip size="small">
              {{ webRTCStore.getVideoCallContact.displayName }}
            </v-chip>
          </div> -->
      </v-card-text>

      <v-card-actions
        :class="
          !webRTCStore.videoCallEstablished ? '' : 'd-flex justify-center'
        "
      >
        <v-btn
          @click="endCall"
          size="x-large"
          icon="mdi-phone-hangup"
          color="error"
          variant="outlined"
        ></v-btn>
        <v-spacer v-if="!webRTCStore.videoCallEstablished"></v-spacer>
        <v-btn
          v-if="
            !webRTCStore.videoCallEstablished &&
            !webRTCStore.videoCallRequestSent
          "
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
  console.log("--> Initializing call...");
  if (
    !webRTCStore.videoCallWaitingForApproval &&
    !webRTCStore.videoCallRequestSent
  ) {
    console.log("--> Initializing new call...");
    await videoCall.initializeCall();
    return;
  }
  if (webRTCStore.videoCallWaitingForApproval) {
    console.log("--> Approving call...");
    videoCall.approveCall();
    return;
  }
  console.error("--> Call is being processed...");
};

const endCall = async () => {
  if (webRTCStore.videoCallWaitingForApproval) {
    videoCall.rejectVideoCall(webRTCStore.getVideoCallContact.displayName);
  } else {
    videoCall.terminateVideoCall(webRTCStore.getVideoCallContact.displayName);
  }
  webRTCStore.cleanup();
  webRTCStore.$reset();
};

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
