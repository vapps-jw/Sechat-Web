import * as base64js from "base64-js";
import { SignalRHubMethods, VideoCodecs } from "~/utilities/globalEnums";

export const useVideoCall = () => {
  const signalRStore = useSignalRStore();
  const sechatChatStore = useSechatChatStore();
  const appStore = useSechatAppStore();

  // const listenForVideo = () => {
  //   console.warn("--> Listening for video ...");

  //   signalRStore.resetMediaSource();

  //   signalRStore.videoCallMediaSource.addEventListener(
  //     "--> Media Source Error",
  //     (e) => signalRStore.videoCallMediaSource.readyState
  //   );

  //   signalRStore.videoCallMediaSource.addEventListener(
  //     "sourceopen",
  //     async () => {
  //       try {
  //         console.log("--> Adding Source buffer");

  //         const sourceBuffer =
  //           signalRStore.videoCallMediaSource.addSourceBuffer(
  //             VideoCodecs.webm9MimeCodec
  //           );

  //         console.log("--> Source buffer", sourceBuffer);
  //         console.log(
  //           "--> Source buffers",
  //           signalRStore.videoCallMediaSource.sourceBuffers
  //         );

  //         sourceBuffer.addEventListener(
  //           "--> Source Buffer Error",
  //           () => signalRStore.videoCallMediaSource.readyState
  //         );

  //         sourceBuffer.mode = "sequence";
  //         sourceBuffer.addEventListener("update", async () => {
  //           if (!sourceBuffer.updating) {
  //             const ab = await signalRStore.getVideoCallChannel.pull();
  //             sourceBuffer.appendBuffer(ab);
  //           }
  //         });
  //         // sourceBuffer.addEventListener("updateend", async () => {
  //         //   if (appStore.getVideoTarget.paused) appStore.getVideoTarget.play();
  //         //   try {
  //         //     const ab = await signalRStore.getVideoCallChannel.pull();
  //         //     if (!sourceBuffer.updating) {
  //         //       sourceBuffer.appendBuffer(ab);
  //         //     }
  //         //   } catch (error) {
  //         //     console.log("--> Buffer [updateend] Error", error);
  //         //   }
  //         // });

  //         try {
  //           if (!sourceBuffer.updating) {
  //             console.warn("--> Buffer initial pull");
  //             const ab = await signalRStore.getVideoCallChannel.pull();
  //             sourceBuffer.appendBuffer(ab);
  //           }
  //         } catch (error) {
  //           console.warn("--> Buffer [sourceopen] Error", error);
  //         }

  //         console.warn(
  //           "--> Source buffers after initial pull",
  //           signalRStore.videoCallMediaSource.sourceBuffers
  //         );
  //       } catch (error) {
  //         console.error("--> Video listener error", error);
  //       }
  //     }
  //   );

  //   appStore.getVideoTarget.src = URL.createObjectURL(
  //     signalRStore.videoCallMediaSource
  //   );
  // };

  // const sendVideo = (userName: string) => {
  //   console.warn("--> Send video to", userName);
  //   const segmentLimit = 20000;

  //   console.warn("--> Video source", appStore.getVideoSource);

  //   signalRStore.resetVideoCallSignalRSubject();
  //   sendVideoCallData(signalRStore.getVideoCallSubject);

  //   async function handleDataAvailable(event) {
  //     const ab = await event.data.arrayBuffer();
  //     const bytes = new Uint8Array(ab);
  //     const ab64 = base64js.fromByteArray(bytes);

  //     if (ab64.length <= segmentLimit) {
  //       if (signalRStore.getVideoCallSubject) {
  //         signalRStore.getVideoCallSubject.next({
  //           index: 0,
  //           part: ab64,
  //           userName: userName,
  //         });
  //       }
  //     } else {
  //       for (let i = 0, ii = 0; i < ab64.length; i += segmentLimit, ii++) {
  //         if (signalRStore.getVideoCallSubject) {
  //           signalRStore.getVideoCallSubject.next({
  //             index: ii,
  //             part: ab64.substr(i, segmentLimit),
  //             userName: userName,
  //           });
  //         }
  //       }
  //     }
  //   }

  //   navigator.mediaDevices
  //     .getUserMedia({ video: true, audio: true })
  //     .then(function (stream) {
  //       signalRStore.resetMediaRecorder(stream);

  //       appStore.getVideoSource.srcObject = stream;
  //       appStore.getVideoSource.play();
  //       signalRStore.videoCallMediaRecorder.ondataavailable =
  //         handleDataAvailable;
  //       signalRStore.videoCallMediaRecorder.start();
  //       const interval = setInterval(
  //         () => signalRStore.videoCallMediaRecorder.requestData(),
  //         200
  //       );
  //       signalRStore.updateVideoCallDataRequestInterval(interval);
  //     });
  // };

  const videoCallRequested = (data: IStringMessage) => {
    let connection = sechatChatStore.getContacts.find(
      (c) => c.displayName === data.message
    );

    console.warn(`--> Video call requested: ${connection?.displayName}`);

    if (!connection) {
      return;
    }

    // if (signalRStore.isVideoCallInProgress) {
    //   console.error("--> Video call already in progress");
    //   return;
    // }

    //signalRStore.initializeVideoCall(connection);
    //signalRStore.updateVideoCallWaitingForApproval(true);
  };

  const videoCallApproved = (data: IStringMessage) => {
    console.warn(`--> Call approved by: ${data.message}`);
    let connection = sechatChatStore.getContacts.find(
      (c) => c.inviterName === data.message || c.invitedName === data.message
    );

    if (!connection) {
      return;
    }

    //signalRStore.updateVideoCallEstablished(true);
    //sendVideo(connection.displayName);
    appStore.showSuccessSnackbar(`Call Answered by ${data.message}`);
  };

  const videoCallRejected = (data: IStringMessage) => {
    console.warn(`--> Call rejected by: ${data.message}`);
    let connection = sechatChatStore.getContacts.find(
      (c) => c.inviterName === data.message || c.invitedName === data.message
    );
    //signalRStore.clearVideoCallData();
    appStore.clearVideoSources();
    appStore.showErrorSnackbar(`Call rejected by ${data.message}`);
  };

  const videoCallTerminated = (data: IStringMessage) => {
    console.warn(`--> Call terminated by: ${data.message}`);
    //signalRStore.clearVideoCallData();
    appStore.clearVideoSources();
    appStore.showWarningSnackbar(`Call ended by ${data.message}`);
  };

  // Video Calls

  const onVideoCallTerminatedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting VideoCallTerminatedEvent");
    connection.on(SignalRHubMethods.VideoCallTerminated, videoCallTerminated);
  };

  const offVideoCallTerminatedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting VideoCallTerminatedEvent");
    connection.off(SignalRHubMethods.VideoCallTerminated, videoCallTerminated);
  };

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

  const sendVideoCallData = (data: signalR.Subject<any>) => {
    signalRStore.connection.send(SignalRHubMethods.SendVideoCallData, data);
  };

  const sendVideoCallRequest = (data: string) => {
    console.log("--> Sending video call request", data);
    signalRStore.updateVideoCallRequestSent(true);
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

  const terminateVideoCall = (data: string) => {
    console.log("--> Sending video call termination", data);
    signalRStore.connection.send(SignalRHubMethods.TerminateVideoCall, {
      message: data,
    });
  };

  return {
    onVideoCallTerminatedEvent,
    onVideoCallApprovedEvent,
    onVideoCallRejectedEvent,
    onVideoCallRequestedEvent,
    offVideoCallTerminatedEvent,
    offVideoCallApprovedEvent,
    offVideoCallRejectedEvent,
    offVideoCallRequestedEvent,
    terminateVideoCall,
    rejectVideoCall,
    sendVideoCallApproved,
    sendVideoCallRequest,
    sendVideoCallData,
    videoCallApproved,
    videoCallRequested,
    videoCallRejected,
  };
};
