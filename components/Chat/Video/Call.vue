<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        size="small"
        icon="mdi-phone"
        color="success"
        variant="outlined"
      ></v-btn>
    </template>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Rooms</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click="hangUp"
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
const dialog = ref<boolean>(false);
const signalR = useSignalR();
const signalRStore = useSignalRStore();

interface PropsModel {
  contact: IConnectionRequest;
}

const props = defineProps<PropsModel>();

const webm9MimeCodec = 'video/webm;codecs="vp8,opus"';
const segmentLimit = 20000;

const videoSource = <HTMLVideoElement>(
  document.getElementById("video-stream-source")
);
const videoTarget = <HTMLVideoElement>(
  document.getElementById("video-stream-target")
);

const mediaSource = new MediaSource();

const hangUp = () => {
  dialog.value = false;
};

watch(dialog, (newVal, oldVal) => {
  console.log("--> Video Call Screen Triggered", newVal, oldVal, props.contact);

  if (!newVal) {
    mediaSource.removeEventListener("sourceopen", incomingMedia);
    signalRStore.terminateVideoCallChannel();
    return;
  }

  if (newVal) {
    signalR.requestVideoCall(props.contact.displayName);
    signalRStore.initiateVideoCallChannel();
    mediaSource.addEventListener("sourceopen", incomingMedia);
  }
});

const incomingMedia = async () => {
  const sourceBuffer = mediaSource.addSourceBuffer(webm9MimeCodec);
  sourceBuffer.mode = "sequence";
  sourceBuffer.addEventListener("updateend", async () => {
    if (videoTarget.paused) videoTarget.play();

    const ab = await signalRStore.videoCallChannel.pull();
    sourceBuffer.appendBuffer(ab);
  });

  const ab = await signalRStore.videoCallChannel.pull();
  sourceBuffer.appendBuffer(ab);
};
</script>
