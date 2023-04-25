export const useVideoCall = () => {
  const signalRStore = useSignalRStore();
  const signalR = useSignalR();

  const startListeningForVideo = () => {
    const videoTarget = <HTMLVideoElement>(
      document.getElementById("video-stream-target")
    );

    const webm9MimeCodec = 'video/webm;codecs="vp8,opus"';
    signalRStore.resetMediaSource();

    signalRStore.getVideoCallMediaSource.addEventListener(
      "sourceopen",
      async () => {
        const sourceBuffer =
          signalRStore.getVideoCallMediaSource.addSourceBuffer(webm9MimeCodec);
        sourceBuffer.mode = "sequence";
        sourceBuffer.addEventListener("updateend", async () => {
          if (videoTarget.paused) videoTarget.play();
          const ab = await await signalRStore.getVideoCallChannel.pull();
          sourceBuffer.appendBuffer(ab);
        });

        const ab = await signalRStore.getVideoCallChannel.pull();
        sourceBuffer.appendBuffer(ab);
      }
    );

    videoTarget.src = URL.createObjectURL(signalRStore.getVideoCallMediaSource);
  };

  const startSendingVideo = () => {};

  return {
    startListeningForVideo,
    startSendingVideo,
  };
};
