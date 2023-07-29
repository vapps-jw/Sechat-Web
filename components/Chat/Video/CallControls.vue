<template>
  <v-btn
    @click="endCall"
    size="x-large"
    icon="mdi-phone-hangup"
    color="error"
    :variant="
      webRTCStore.videoCallEstablished || webRTCStore.videoCallRequestSent
        ? 'elevated'
        : 'outlined'
    "
  ></v-btn>
  <v-spacer v-if="!webRTCStore.videoCallEstablished"></v-spacer>
  <v-btn
    v-if="
      !webRTCStore.videoCallEstablished && !webRTCStore.videoCallRequestSent
    "
    @click="newVideoCall"
    size="x-large"
    icon="mdi-phone"
    color="success"
    variant="outlined"
  ></v-btn>
  <v-spacer v-if="webRTCStore.videoCallEstablished"></v-spacer>
  <v-btn
    class="mr-3 hidden-md-and-down"
    :disabled="
      webRTCStore.ScreenShareState === SignalRCustonMessages.ScreenShareBusy ||
      webRTCStore.screenShare
    "
    v-if="webRTCStore.videoCallEstablished"
    @click="videoCall.toggleScreenShare"
    size="x-large"
    :icon="
      webRTCStore.screenShare ? 'mdi-monitor-shimmer' : 'mdi-monitor-share'
    "
    :color="webRTCStore.screenShare ? 'warning' : 'accent'"
    :variant="webRTCStore.videoCallEstablished ? 'elevated' : 'outlined'"
  ></v-btn>
  <v-btn
    v-if="webRTCStore.videoCallEstablished"
    @click="videoCall.toggleCamera"
    size="x-large"
    :icon="webRTCStore.camOn ? 'mdi-video' : 'mdi-video-off'"
    :color="webRTCStore.camOn ? 'success' : 'error'"
    :variant="webRTCStore.videoCallEstablished ? 'elevated' : 'outlined'"
  ></v-btn>
  <v-btn
    class="ml-3"
    v-if="webRTCStore.videoCallEstablished"
    @click="videoCall.toggleMicrophone"
    size="x-large"
    :icon="webRTCStore.micOn ? 'mdi-microphone' : 'mdi-microphone-off'"
    :color="webRTCStore.micOn ? 'success' : 'error'"
    :variant="webRTCStore.videoCallEstablished ? 'elevated' : 'outlined'"
  ></v-btn>
</template>

<script setup lang="ts">
import { SignalRCustonMessages } from "~/utilities/globalEnums";

const videoCall = useVideoCall();
const webRTCStore = useWebRTCStore();

const newVideoCall = async () => {
  console.log("Initializing call...");
  if (
    !webRTCStore.videoCallWaitingForApproval &&
    !webRTCStore.videoCallRequestSent
  ) {
    console.log("Initializing new call...");
    await videoCall.initializeCall();
    return;
  }
  if (webRTCStore.videoCallWaitingForApproval) {
    console.log("Approving call...");
    await videoCall.approveCall();
    return;
  }
  console.error("Call is being processed...");
};

const endCall = async () => {
  if (webRTCStore.videoCallWaitingForApproval) {
    await videoCall.rejectVideoCall(
      webRTCStore.getVideoCallContact.displayName
    );
  } else {
    videoCall.terminateVideoCall(webRTCStore.getVideoCallContact.displayName);
  }
  webRTCStore.terminateShare();
  webRTCStore.cleanup();
  webRTCStore.$reset();
};
</script>

<style scoped></style>
