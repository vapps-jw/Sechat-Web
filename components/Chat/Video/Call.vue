<template>
  <v-container>
    <v-card class="sechat-v-card">
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <div>Me:</div>
        <video id="video-stream-source" autoplay></video>
        <div>Him:</div>
        <video id="video-stream-target" autoplay></video>
      </v-card-text>
      <!-- <v-card-text
        v-else
        class="d-flex ma-0 pa-0 overflow-auto justify-center align-center"
      >
        <div class="text-h2">
          Call {{ signalRStore.videoCallContact.displayName }}?
        </div>
      </v-card-text> -->
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
    videoCall.listenForVideo();
    videoCall.sendVideoCallRequest(
      signalRStore.getVideoCallContact.displayName
    );
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
  } catch (error) {
    console.error(error);
  }
};

onBeforeUnmount(() => {
  console.warn("--> Video Call onBeforeUnmount");
});
</script>
