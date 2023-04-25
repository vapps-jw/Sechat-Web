<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Rooms</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click="terminateCall"
          size="small"
          icon="mdi-phone-hangup"
          color="error"
          variant="outlined"
        ></v-btn>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <video id="video-stream-source" autoplay></video>
        <video id="video-stream-target" autoplay></video>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { VideoCallStatus } from "~/utilities/globalEnums";
import * as base64js from "base64-js";

const dialog = ref<boolean>(false);
const signalR = useSignalR();
const signalRStore = useSignalRStore();
const userStore = useUserStore();

interface PropsModel {
  contact: IConnectionRequest;
}

const props = defineProps<PropsModel>();

const webm9MimeCodec = 'video/webm;codecs="vp8,opus"';
const segmentLimit = 20000;
let mediaRecorder = null;

const videoSource = <HTMLVideoElement>(
  document.getElementById("video-stream-source")
);
const videoTarget = <HTMLVideoElement>(
  document.getElementById("video-stream-target")
);

const mediaSource = new MediaSource();

const newVideoCall = async (uc: IConnectionRequest) => {
  // listen to contact video
  signalRStore.initializeVideoCall(uc);

  const sourceBuffer = mediaSource.addSourceBuffer(webm9MimeCodec);
  sourceBuffer.mode = "sequence";
  sourceBuffer.addEventListener("updateend", incomingMedia);

  const ab = await signalRStore.getVideoCallChannel.pull();
  sourceBuffer.appendBuffer(ab);

  videoTarget.src = URL.createObjectURL(mediaSource);

  // record current user video
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(function (stream) {
      videoSource.srcObject = stream;
      videoSource.play();
      mediaRecorder = new MediaRecorder(stream, { mimeType: webm9MimeCodec });
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start();
      setInterval(() => mediaRecorder.requestData(), 40);
    });
};

const answerVideoCall = () => {};

const terminateCall = () => {
  mediaSource.removeEventListener("updateend", incomingMedia);
  signalRStore.terminateVideoCall();
};

const { videoCallStatus } = storeToRefs(signalRStore);

watch(videoCallStatus, async (newVal, oldVal) => {
  console.log("--> Video Call Screen Triggered", newVal, oldVal, props.contact);

  if (newVal == VideoCallStatus.Initialized) {
  }
});

const incomingMedia = async () => {
  const sourceBuffer = mediaSource.addSourceBuffer(webm9MimeCodec);
  sourceBuffer.mode = "sequence";
  sourceBuffer.addEventListener("updateend", async () => {
    if (videoTarget.paused) videoTarget.play();

    const ab = await signalRStore.getVideoCallChannel.pull();
    sourceBuffer.appendBuffer(ab);
  });

  const ab = await signalRStore.getVideoCallChannel.pull();
  sourceBuffer.appendBuffer(ab);
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
</script>
