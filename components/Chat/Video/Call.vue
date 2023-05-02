<template>
  <v-container>
    <v-card class="sechat-v-card">
      <!-- Waiting for approval -->
      <v-card-text
        class="ma-2 pa-02 overflow-auto"
        v-if="signalRStore.isCallWaitingForApproval"
      >
        <div class="d-flex justify-center">
          <p class="text-h5 text-center">
            {{ signalRStore.videoCallContact.displayName }}
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
          !signalRStore.isCallEstablished &&
          !signalRStore.videoCallRequestSent &&
          !signalRStore.isCallWaitingForApproval
        "
      >
        <div class="d-flex justify-center">
          <p class="text-h5 text-center">
            Call {{ signalRStore.videoCallContact.displayName }}?
          </p>
        </div>
      </v-card-text>
      <!-- Waiting for approval -->
      <v-card-text
        class="ma-2 pa-02 overflow-auto"
        v-if="
          signalRStore.videoCallRequestSent && !signalRStore.isCallEstablished
        "
      >
        <div class="d-flex justify-center">
          <p class="text-h5 text-center">
            Calling {{ signalRStore.videoCallContact.displayName }}
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
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-sheet class="d-flex justify-center video-source-size ma-2">
          <video id="video-stream-source" class="rounded-lg" autoplay></video>
        </v-sheet>
        <div class="video-target-size ma-1">
          <video id="video-stream-target" class="rounded-lg" autoplay></video>
        </div>
        <div
          v-if="signalRStore.isCallEstablished"
          class="d-flex justify-center text-center"
        >
          <v-chip size="small">
            {{ signalRStore.videoCallContact.displayName }}
          </v-chip>
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
  // try {
  //   if (
  //     !signalRStore.isCallWaitingForApproval &&
  //     !signalRStore.videoCallRequestSent
  //   ) {
  //     console.log("--> Initializing call...");
  //     videoCall.sendVideoCallRequest(
  //       signalRStore.getVideoCallContact.displayName
  //     );
  //     videoCall.listenForVideo();
  //     return;
  //   }
  //   if (signalRStore.isCallWaitingForApproval) {
  //     console.log("--> Approving call...");
  //     videoCall.sendVideoCallApproved(
  //       signalRStore.getVideoCallContact.displayName
  //     );
  //     signalRStore.updateVideoCallEstablished(true);
  //     signalRStore.updateVideoCallWaitingForApproval(false);
  //     videoCall.listenForVideo();
  //     console.log("--> Sending video...");
  //     videoCall.sendVideo(signalRStore.getVideoCallContact.displayName);
  //     return;
  //   }
  //   console.warn("--> Call already in progress");
  // } catch (error) {
  //   console.error(error);
  // }
};

const endCall = async () => {
  // try {
  //   console.warn("--> Video call endCall");
  //   if (signalRStore.isCallWaitingForApproval) {
  //     videoCall.rejectVideoCall(signalRStore.getVideoCallContact.displayName);
  //   } else {
  //     videoCall.terminateVideoCall(
  //       signalRStore.getVideoCallContact.displayName
  //     );
  //   }
  //   signalRStore.clearVideoCallData();
  //   appStore.clearVideoSources();
  // } catch (error) {
  //   console.error(error);
  //}
};

onMounted(() => {
  console.warn("--> Video call view Mounted");
  //   appStore.clearVideoSources();
  //   appStore.updateVideoTarget(
  //     <HTMLVideoElement>document.getElementById("video-stream-target")
  //   );
  //   appStore.updateVideoSource(
  //     <HTMLVideoElement>document.getElementById("video-stream-source")
  //   );
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
