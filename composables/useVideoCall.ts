import * as base64js from "base64-js";

export const useVideoCall = () => {
  const signalRStore = useSignalRStore();
  const signalR = useSignalR();
  const sechatChatStore = useSechatChatStore();
  const userStore = useUserStore();

  const listenForVideo = () => {
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
          const ab = await signalRStore.getVideoCallChannel.pull();
          sourceBuffer.appendBuffer(ab);
        });

        const ab = await signalRStore.getVideoCallChannel.pull();
        sourceBuffer.appendBuffer(ab);
      }
    );

    videoTarget.src = URL.createObjectURL(signalRStore.getVideoCallMediaSource);
  };

  const sendVideo = () => {
    const webm9MimeCodec = 'video/webm;codecs="vp8,opus"';
    const segmentLimit = 20000;
    let mediaRecorder = null;

    const videoSource = <HTMLVideoElement>(
      document.getElementById("video-stream-source")
    );

    signalRStore.resetVideoCallSignalRSubject();
    signalR.sendVideoCallData(signalRStore.getVideoCallSubject);

    async function handleDataAvailable(event) {
      const ab = await event.data.arrayBuffer();
      const bytes = new Uint8Array(ab);
      const ab64 = base64js.fromByteArray(bytes);

      if (ab64.length <= segmentLimit) {
        signalRStore.getVideoCallSubject.next({
          index: 0,
          part: ab64,
          userName: userStore.getUserName,
        });
      } else {
        for (let i = 0, ii = 0; i < ab64.length; i += segmentLimit, ii++) {
          signalRStore.getVideoCallSubject.next({
            index: ii,
            part: ab64.substr(i, segmentLimit),
            userName: userStore.getUserName,
          });
        }
      }
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        videoSource.srcObject = stream;
        videoSource.play();
        mediaRecorder = new MediaRecorder(stream, { mimeType: webm9MimeCodec });
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        setInterval(() => mediaRecorder.requestData(), 200);
      });
  };

  const videoCallRequested = (data: IStringMessage) => {
    console.warn(`--> CALL INCOMING FROM: ${data.message}`);
    let connection = sechatChatStore.getConnections.find(
      (c) => c.invitedName === data.message || c.invitedName === data.message
    );

    if (connection) {
      signalRStore.showVideoCallDialog(connection);
    }
  };

  const videoCallApproved = (data: IStringMessage) => {
    console.warn(`--> Call approved by: ${data.message}`);
    let connection = sechatChatStore.getConnections.find(
      (c) => c.invitedName === data.message || c.invitedName === data.message
    );
  };

  const videoCallRejected = (data: IStringMessage) => {
    console.warn(`--> Call rejected by: ${data.message}`);
    let connection = sechatChatStore.getConnections.find(
      (c) => c.invitedName === data.message || c.invitedName === data.message
    );
  };

  const handleVideoCallDataIncoming = (data: IVideoCallData) => {
    if (data.part.length === 0) {
      return;
    }

    let partBuffer = [];
    partBuffer.push(data.part);

    const ba = base64js.toByteArray(partBuffer.reduce((a, b) => a + b));
    signalRStore.videoCallChannel.push(ba.buffer);
  };

  return {
    handleVideoCallDataIncoming,
    videoCallApproved,
    videoCallRequested,
    videoCallRejected,
    listenForVideo,
    sendVideo,
  };
};
