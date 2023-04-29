<template>
  <v-container>
    <v-card class="sechat-v-card">
      <v-card-text
        class="ma-0 pa-0 overflow-auto"
        v-if="signalRStore.isCallWaitingForApproval"
      >
        <div>Calling: {{ signalRStore.videoCallContact.displayName }}</div>
      </v-card-text>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-sheet rounded class="d-flex justify-center">
          <div class="video-source-size">
            <video id="video-stream-source" autoplay></video>
          </div>
        </v-sheet>

        <div class="d-flex justify-center"></div>
        <div class="video-target-size">
          <video id="video-stream-target" autoplay></video>
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
const signalRStore = useSignalRStore();
const videoCall = useVideoCall();
const appStore = useSechatAppStore();

const newVideoCall = async () => {
  try {
    if (!signalRStore.isCallWaitingForApproval) {
      videoCall.sendVideoCallRequest(
        signalRStore.getVideoCallContact.displayName
      );
    }

    videoCall.listenForVideo();

    if (signalRStore.isCallWaitingForApproval) {
      videoCall.sendVideoCallApproved(
        signalRStore.getVideoCallContact.displayName
      );
      signalRStore.updateCallWaitingForApproval(false);
      videoCall.sendVideo(signalRStore.getVideoCallContact.displayName);
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  console.warn("--> Video call view Mounted");
  appStore.updateVideoTarget(
    <HTMLVideoElement>document.getElementById("video-stream-target")
  );
  appStore.updateVideoSource(
    <HTMLVideoElement>document.getElementById("video-stream-source")
  );
});

const endCall = async () => {
  try {
    videoCall.rejectVideoCall(signalRStore.getVideoCallContact.displayName);
    signalRStore.clearVideoCallData();
    appStore.clearVideoSources();
  } catch (error) {
    console.error(error);
  }
};

onBeforeUnmount(() => {
  signalRStore.clearVideoCallData();
  appStore.clearVideoSources();
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
