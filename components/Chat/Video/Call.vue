<template>
  <v-container>
    <v-card class="sechat-v-card">
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <video id="video-stream-source" autoplay></video>
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
          @click="terminateCall"
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
import * as base64js from "base64-js";

const signalR = useSignalR();
const signalRStore = useSignalRStore();
const userStore = useUserStore();
const videoCall = useVideoCall();

const webm9MimeCodec = 'video/webm;codecs="vp8,opus"';
const segmentLimit = 20000;
let mediaRecorder = null;

let videoSource = <HTMLVideoElement>(
  document.getElementById("video-stream-source")
);
let videoTarget = <HTMLVideoElement>(
  document.getElementById("video-stream-target")
);

const mediaSource = new MediaSource();

const newVideoCall = async () => {
  try {
    videoCall.startListeningForVideo();
    signalR.sendVideoCallRequest(signalRStore.getVideoCallContact.displayName);
  } catch (error) {
    console.error(error);
  }
};

const answerVideoCall = () => {};

const terminateCall = () => {
  signalRStore.terminateVideoCall();
};

const handleDataAvailable = async (event) => {
  const ab = await event.data.arrayBuffer();
  const bytes = new Uint8Array(ab);
  const ab64 = base64js.fromByteArray(bytes);

  if (ab64.length <= segmentLimit) {
    signalRStore.videoCallSubject.next({
      index: 0,
      part: ab64,
      userName: userStore.getUserName,
    });
  } else {
    for (let i = 0, ii = 0; i < ab64.length; i += segmentLimit, ii++) {
      signalRStore.videoCallSubject.next({
        index: ii,
        part: ab64.substr(i, segmentLimit),
        userName: userStore.getUserName,
      });
    }
  }
};

onBeforeUnmount(() => {
  console.warn("--> Vide Call onBeforeUnmount");
});
</script>
