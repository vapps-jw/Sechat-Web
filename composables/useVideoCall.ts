import * as base64js from "base64-js";
import { SignalRHubMethods } from "~/utilities/globalEnums";

export const useVideoCall = () => {
  const signalRStore = useSignalRStore();
  const sechatChatStore = useSechatChatStore();
  const appStore = useSechatAppStore();

  const listenForVideo = () => {
    console.warn("--> Listening for video ...");

    const webm9MimeCodec = 'video/webm;codecs="vp8,opus"';
    signalRStore.resetMediaSource();

    signalRStore.videoCallMediaSource.addEventListener(
      "sourceopen",
      async () => {
        try {
          const sourceBuffer =
            signalRStore.videoCallMediaSource.addSourceBuffer(webm9MimeCodec);
          sourceBuffer.mode = "sequence";
          sourceBuffer.addEventListener("updateend", async () => {
            if (appStore.getVideoTarget.paused) appStore.getVideoTarget.play();
            const ab = await signalRStore.getVideoCallChannel.pull();
            sourceBuffer.appendBuffer(ab);
          });

          const ab = await signalRStore.getVideoCallChannel.pull();
          sourceBuffer.appendBuffer(ab);
        } catch (error) {
          console.error("--> Video listener error", error);
        }
      }
    );

    appStore.getVideoTarget.src = URL.createObjectURL(
      signalRStore.videoCallMediaSource
    );
  };

  const sendVideo = (userName: string) => {
    console.warn("--> Send video to", userName);
    const segmentLimit = 20000;
    let mediaRecorder = null;

    console.warn("--> Video source", appStore.getVideoSource);

    signalRStore.resetVideoCallSignalRSubject();
    sendVideoCallData(signalRStore.getVideoCallSubject);

    async function handleDataAvailable(event) {
      const ab = await event.data.arrayBuffer();
      const bytes = new Uint8Array(ab);
      const ab64 = base64js.fromByteArray(bytes);

      if (ab64.length <= segmentLimit) {
        if (signalRStore.getVideoCallSubject) {
          signalRStore.getVideoCallSubject.next({
            index: 0,
            part: ab64,
            userName: userName,
          });
        }
      } else {
        for (let i = 0, ii = 0; i < ab64.length; i += segmentLimit, ii++) {
          if (signalRStore.getVideoCallSubject) {
            signalRStore.getVideoCallSubject.next({
              index: ii,
              part: ab64.substr(i, segmentLimit),
              userName: userName,
            });
          }
        }
      }
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        signalRStore.resetMediaRecorder(stream);

        appStore.getVideoSource.srcObject = stream;
        appStore.getVideoSource.play();
        mediaRecorder = signalRStore.getVideoCallMediaRecorder;
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        const interval = setInterval(() => mediaRecorder.requestData(), 100);
        signalRStore.updateVideoCallDataRequestInterval(interval);
      });
  };

  const videoCallRequested = (data: IStringMessage) => {
    let connection = sechatChatStore.getConnections.find(
      (c) => c.displayName === data.message
    );

    console.warn(`--> Video call requested: ${connection?.displayName}`);

    if (!connection) {
      return;
    }

    signalRStore.initializeVideoCall(connection);
    signalRStore.updateCallWaitingForApproval(true);
  };

  const videoCallApproved = (data: IStringMessage) => {
    console.warn(`--> Call approved by: ${data.message}`);
    let connection = sechatChatStore.getConnections.find(
      (c) => c.invitedName === data.message || c.invitedName === data.message
    );

    console.warn(`--> Sending video data to: ${connection.displayName}`);
    sendVideo(connection.displayName);
  };

  const videoCallRejected = (data: IStringMessage) => {
    console.warn(`--> Call rejected by: ${data.message}`);
    let connection = sechatChatStore.getConnections.find(
      (c) => c.invitedName === data.message || c.invitedName === data.message
    );
    console.warn(`--> Call rejected by: ${connection?.displayName}`);
    signalRStore.clearVideoCallData();
    appStore.clearVideoSources();
  };

  const handleVideoCallDataIncoming = (data: IVideoCallData) => {
    if (data.part.length === 0) {
      return;
    }

    if (signalRStore.videoCallLastIndex >= data.index) {
      const ba = base64js.toByteArray(
        signalRStore.videoCallPartBuffer.reduce((a, b) => a + b)
      );
      signalRStore.videoCallChannel.push(ba.buffer);
      signalRStore.videoCallPartBuffer = [];
    }

    signalRStore.videoCallPartBuffer.push(data.part);
    signalRStore.videoCallLastIndex = data.index;
  };

  // Video Calls

  const onVideoCallApprovedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting VideoCallApprovedEvent");
    connection.on(SignalRHubMethods.VideoCallApproved, videoCallApproved);
  };

  const offVideoCallApprovedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting VideoCallApprovedEvent");
    connection.off(SignalRHubMethods.VideoCallApproved, videoCallApproved);
  };

  const onVideoCallRejectedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting VideoCallRejectedEvent");
    connection.on(SignalRHubMethods.VideoCallRejected, videoCallRejected);
  };

  const offVideoCallRejectedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting VideoCallRejectedEvent");
    connection.off(SignalRHubMethods.VideoCallRejected, videoCallRejected);
  };

  const onVideoCallRequestedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting VideoCallRequestedEvent");
    connection.on(SignalRHubMethods.VideoCallRequested, videoCallRequested);
  };

  const offVideoCallRequestedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting VideoCallRequestedEvent");
    connection.off(SignalRHubMethods.VideoCallRequested, videoCallRequested);
  };

  const onVideoCallDataIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting VideoCallIncomingEvent");
    connection.on(
      SignalRHubMethods.VideoCallDataIncoming,
      handleVideoCallDataIncoming
    );
  };

  const offVideoCallDataIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting VideoCallIncomingEvent");
    connection.off(
      SignalRHubMethods.VideoCallDataIncoming,
      handleVideoCallDataIncoming
    );
  };

  const sendVideoCallData = (data: signalR.Subject<any>) => {
    signalRStore.connection.send(SignalRHubMethods.SendVideoCallData, data);
  };

  const sendVideoCallRequest = (data: string) => {
    console.log("--> Sending video call request", data);
    signalRStore.connection.send(SignalRHubMethods.VideoCallRequest, {
      message: data,
    });
  };

  const sendVideoCallApproved = (data: string) => {
    console.log("--> Sending video call approved", data);
    signalRStore.connection.send(SignalRHubMethods.ApproveVideoCall, {
      message: data,
    });
  };

  const rejectVideoCall = (data: string) => {
    console.log("--> Sending video call rejection", data);
    signalRStore.connection.send(SignalRHubMethods.RejectVideoCall, {
      message: data,
    });
  };

  return {
    onVideoCallApprovedEvent,
    onVideoCallRejectedEvent,
    onVideoCallRequestedEvent,
    onVideoCallDataIncomingEvent,
    offVideoCallApprovedEvent,
    offVideoCallRejectedEvent,
    offVideoCallRequestedEvent,
    offVideoCallDataIncomingEvent,
    rejectVideoCall,
    sendVideoCallApproved,
    sendVideoCallRequest,
    sendVideoCallData,
    handleVideoCallDataIncoming,
    videoCallApproved,
    videoCallRequested,
    videoCallRejected,
    listenForVideo,
    sendVideo,
  };
};
