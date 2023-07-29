import {
  DisplayMediaSettings,
  SignalRCustonMessages,
  SignalRHubMethods,
  VideoSettings,
} from "~/utilities/globalEnums";

export const useVideoCall = () => {
  const signalRStore = useSignalRStore();
  const chatStore = useSechatChatStore();
  const appStore = useSechatAppStore();
  const webRTCStore = useWebRTCStore();
  const sechatApp = useSechatApp();
  const config = useRuntimeConfig();

  const registerCall = async (calleeName: string) => {
    console.log("Registering Call");
    const { error: apiError, data: newCallLog } = await useFetch<ICallLog>(
      `${config.public.apiBase}/call/register`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          CaleeName: calleeName,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    return newCallLog.value;
  };

  const getCallLogs = async (lastLog?: number) => {
    console.log("Getting Call");
    const route = `${config.public.apiBase}/call/logs${
      lastLog ? "/" + lastLog : ""
    }`;
    const { error: apiError, data: callLogs } = await useFetch<ICallLog[]>(
      route,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    return callLogs.value;
  };

  const callAnswered = async (calleeName: string) => {
    console.log("Answering Call");
    const { error: apiError } = await useFetch<IMessageDecryptionRequest>(
      `${config.public.apiBase}/call/answer`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        credentials: "include",
        body: {
          CaleeName: calleeName,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }
  };

  const callLogsViewed = async () => {
    console.log("Call Logs Viewed Api");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/call/logs-viewed`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        credentials: "include",
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }
  };

  const callRejected = async (calleeName: string) => {
    console.log("Rejecting Call");
    const { error: apiError } = await useFetch<IMessageDecryptionRequest>(
      `${config.public.apiBase}/call/reject`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        credentials: "include",
        body: {
          CaleeName: calleeName,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }
  };

  const getICECandidates = async () => {
    const { data: servers, error: apiError } = await (<any>(
      useFetch("/api/webRTC/turn")
    ));
    if (apiError.value) {
      console.error("TURN Error", apiError.value.data);
      return;
    }

    return JSON.parse(JSON.stringify(servers.value));
  };

  const initializeCall = async () => {
    webRTCStore.updateVideoCallRequestSent(true);

    const localStream = await navigator.mediaDevices.getUserMedia(
      VideoSettings
    );
    webRTCStore.updateLocalStream(localStream);
    console.warn("Local Stream check", webRTCStore.localStream);
    webRTCStore.addLocalStreamToPlayer();

    console.warn("Sending call request", webRTCStore.getVideoCallContactName);
    signalRStore.connection.send(SignalRHubMethods.VideoCallRequest, {
      message: webRTCStore.getVideoCallContactName,
    });

    webRTCStore.updateSourcePlayerVisible(true);

    await createPeerConnection(webRTCStore.getVideoCallContactName);

    console.warn("Local Player", webRTCStore.localVideo);
    console.warn("Remote Player", webRTCStore.remoteVideo);

    await registerCall(webRTCStore.getVideoCallContactName);
    startCalling();
  };

  const startCalling = () => {
    webRTCStore.callNotificationInterval = setInterval(function () {
      signalRStore.connection.send(SignalRHubMethods.VideoCallRequest, {
        message: webRTCStore.getVideoCallContactName,
      });
    }, 5000);
  };

  const stopCalling = async () => {
    console.warn("Stopped Calling...");
    webRTCStore.stopCalling();
  };

  const approveCall = async () => {
    webRTCStore.updateVideoCallWaitingForApproval(false);
    webRTCStore.updateVideoCallEstablished(true);

    await createPeerConnection(webRTCStore.getVideoCallContactName);

    approveVideoCall({
      message: webRTCStore.getVideoCallContact.displayName,
    });
  };

  const videoCallRequestReceived = (data: IStringMessage) => {
    let contact = chatStore.getContacts.find(
      (c) => c.displayName === data.message
    );
    console.warn(`Video call requested received: ${contact?.displayName}`);

    if (
      webRTCStore.videoCallEstablished ||
      webRTCStore.videoCallWaitingForApproval
    ) {
      return;
    }

    webRTCStore.updateVideoCallWaitingForApproval(true);
    webRTCStore.updateVideoCallViewVisible(true);
    webRTCStore.updateVideoCallContact(contact);
  };

  // Handle Incoming Offer
  const offerIncoming = async (data: IStringUserMessage) => {
    console.warn(
      "Offer Incoming, creating answer",
      data.userName,
      JSON.parse(data.message)
    );

    webRTCStore.peerConnection
      .setRemoteDescription(JSON.parse(data.message))
      .then(() => {
        webRTCStore.readyToReceiveCandidates = true;
        console.log("Remote description set");
        return Promise.all(
          webRTCStore.remoteIceCandidatesBuffer.map((c) =>
            webRTCStore.peerConnection.addIceCandidate(c)
          )
        );
      })
      .then(() => {
        console.log("All stored candidates added");
        webRTCStore.remoteIceCandidatesBuffer.length = 0;
      })
      .catch((err) => console.error("Error when adding ICE candidates", err));

    let answer = await webRTCStore.peerConnection.createAnswer();
    await webRTCStore.peerConnection.setLocalDescription(answer);

    const answerToSend = {
      username: webRTCStore.getVideoCallContactName,
      message: JSON.stringify(answer),
    };

    console.warn("Sending answer", answerToSend);
    sendWebRTCAnswer(answerToSend);
  };

  // Handle Incoming Answer
  const answerIncoming = (data: IStringUserMessage) => {
    console.warn("Answer Incoming", JSON.parse(data.message));

    console.warn("Setting remote description...");
    webRTCStore.peerConnection
      .setRemoteDescription(JSON.parse(data.message))
      .then(() => {
        webRTCStore.readyToReceiveCandidates = true;
        console.log(
          "Remote description set, candidates in buffer:",
          webRTCStore.remoteIceCandidatesBuffer.length
        );
        return Promise.all(
          webRTCStore.remoteIceCandidatesBuffer.map((c) =>
            webRTCStore.peerConnection.addIceCandidate(c)
          )
        );
      })
      .then(() => {
        console.log("All stored candidates added");
        webRTCStore.remoteIceCandidatesBuffer.length = 0;
      })
      .catch((err) => console.error("Error when adding ICE candidates", err));

    console.warn("Answer added...");
    webRTCStore.updateVideoCallEstablished(true);
    webRTCStore.updateTargetPlayerVisible(true);
  };

  const screenShareToggledByOtherUser = (data: IStringMessage) => {
    console.log("Screen share toggle db other user", data);
    webRTCStore.ScreenShareState = data.message;
  };

  const ICECandidateIncoming = (data: IStringMessage) => {
    if (webRTCStore.readyToReceiveCandidates) {
      console.warn("ICE Candidate being added!", JSON.parse(data.message));
      webRTCStore.peerConnection.addIceCandidate(JSON.parse(data.message));
    } else {
      console.warn(
        "ICE Candidate being added to buffer!",
        JSON.parse(data.message)
      );
      webRTCStore.remoteIceCandidatesBuffer.push(JSON.parse(data.message));
    }
  };

  const createPeerConnection = async (userName: string) => {
    console.log("Creating peer connection");

    const servers = await getICECandidates();
    console.warn("ICE SERVERS", servers);
    const peerConnection = new RTCPeerConnection({
      iceServers: servers,
      iceTransportPolicy: "all",
      iceCandidatePoolSize: 0,
    });

    webRTCStore.updatePeerConnection(peerConnection);

    webRTCStore.createRemoteStream();
    webRTCStore.addRemoteStreamToPlayer();

    if (!webRTCStore.localStream) {
      webRTCStore.updateLocalStream(
        await navigator.mediaDevices.getUserMedia(VideoSettings)
      );
      webRTCStore.addLocalStreamToPlayer();
    }

    console.log("Checking local stream", webRTCStore.localStream);
    console.log("Checking remote stream", webRTCStore.remoteStream);

    console.log("Getting tracks", webRTCStore.localStream);
    webRTCStore.localStream.getTracks().forEach((track) => {
      webRTCStore.peerConnection.addTrack(track, webRTCStore.localStream);
    });

    webRTCStore.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        webRTCStore.remoteStream.addTrack(track);
      });
    };

    webRTCStore.peerConnection.onconnectionstatechange = (e) => {
      console.warn(
        "Connection state change",
        webRTCStore.peerConnection?.connectionState
      );

      if (!webRTCStore.peerConnection) {
        return;
      }

      switch (webRTCStore.peerConnection.connectionState) {
        case "connecting":
          break;
        case "failed":
          appStore.showErrorSnackbar("Connection error");
          webRTCStore.cleanup();
          webRTCStore.$reset();
          break;
        case "connected":
          appStore.showSuccessSnackbar("You are connected");
          break;
        default:
          break;
      }
    };

    webRTCStore.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log("Sending ICE Candidate");
        sendICECandiadate({
          userName: userName,
          message: JSON.stringify(event.candidate),
        });
      }
    };
  };

  const createAndSendOffer = async (userName: string) => {
    console.log("Creating and senting offer", userName);

    let offer = await webRTCStore.peerConnection.createOffer();
    await webRTCStore.peerConnection.setLocalDescription(offer);
    sendWebRTCOffer({
      userName: userName,
      message: JSON.stringify(offer),
    });
  };

  const toggleCamera = () => {
    // TODO: fire signalR signal to peer
    webRTCStore.camOn = !webRTCStore.camOn;

    let videoTrack = webRTCStore.getLocalVideoTrack;
    if (!videoTrack) {
      webRTCStore.camOn = !webRTCStore.camOn;
      return;
    }

    if (webRTCStore.camOn) {
      videoTrack.enabled = true;
    } else {
      videoTrack.enabled = false;
    }
  };

  const toggleMicrophone = () => {
    // TODO: fire signalR signal to peer
    webRTCStore.micOn = !webRTCStore.micOn;

    let audioTrack = webRTCStore.getLocalAudioTrack;
    if (!audioTrack) {
      webRTCStore.micOn = !webRTCStore.micOn;
      return;
    }

    if (webRTCStore.micOn) {
      audioTrack.enabled = true;
    } else {
      audioTrack.enabled = false;
    }
  };

  const toggleScreenShare = async () => {
    console.log("Screen share toggled");

    if (webRTCStore.screenShare) {
      await switchToCam();
    } else {
      await switchToScreenShare();
    }
  };

  const switchToCam = async () => {
    console.log("Switching to CAM", webRTCStore.screenShare);
    const localStream = await navigator.mediaDevices.getUserMedia(
      VideoSettings
    );

    const [videoTrack] = localStream.getVideoTracks();
    const sender = webRTCStore.peerConnection
      .getSenders()
      .find((s) => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);

    signalScreenShare(
      webRTCStore.getVideoCallContactName,
      SignalRCustonMessages.ScreenShareFree
    );
    webRTCStore.screenShare = false;
  };

  const switchToScreenShare = async () => {
    console.log("Switching to SCREEN SHARE", webRTCStore.screenShare);
    const screenShareStream = await navigator.mediaDevices.getDisplayMedia(
      DisplayMediaSettings
    );
    const [videoTrack] = screenShareStream.getVideoTracks();

    screenShareStream
      .getVideoTracks()[0]
      .addEventListener("ended", async () => {
        console.error("Terminated by browser Event!");
        await switchToCam();
      });

    const sender = webRTCStore.peerConnection
      .getSenders()
      .find((s) => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);

    signalScreenShare(
      webRTCStore.getVideoCallContactName,
      SignalRCustonMessages.ScreenShareBusy
    );
    webRTCStore.screenShare = true;
  };

  const signalScreenShare = (userName: string, screenShareState: string) => {
    console.log(
      "Signalling Screen Share state change",
      userName,
      screenShareState
    );
    signalRStore.connection.send(SignalRHubMethods.SendScreenShareStateChange, {
      userName: userName,
      message: screenShareState,
    });
  };

  // WebRTC

  const sendICECandiadate = (data: IStringUserMessage) => {
    signalRStore.connection.send(SignalRHubMethods.SendICECandidate, data);
  };

  const sendWebRTCOffer = (data: IStringUserMessage) => {
    console.warn("Sending WebRTC Offer", data);
    signalRStore.connection.send(SignalRHubMethods.SendWebRTCOffer, data);
  };

  const sendWebRTCAnswer = (data: IStringUserMessage) => {
    signalRStore.connection.send(SignalRHubMethods.SendWebRTCAnswer, data);
  };

  // Call approved

  const approveVideoCall = async (data: IStringUserMessage) => {
    console.log("Sending video call approved", data);
    signalRStore.connection.send(SignalRHubMethods.ApproveVideoCall, data);
    // Update call log
    await callAnswered(webRTCStore.getVideoCallContactName);
    chatStore.loadCallLogs(await getCallLogs());
    await sechatApp.clearVideoCallNotifications();
  };

  // Call Approved Sending Offer

  const videoCallApproved = async (data: IStringMessage) => {
    console.warn(`Call approved by: ${data.message}`);
    stopCalling();
    let connection = chatStore.getContacts.find(
      (c) => c.inviterName === data.message || c.invitedName === data.message
    );
    if (!connection) {
      return;
    }

    createAndSendOffer(connection.displayName);
    chatStore.loadCallLogs(await getCallLogs());
    appStore.showSuccessSnackbar(`Call Answered by ${data.message}`);
  };

  // Call rejected

  const rejectVideoCall = async (data: string) => {
    console.log("Sending video call rejection", data);
    signalRStore.connection.send(SignalRHubMethods.RejectVideoCall, {
      message: data,
    });
    // Update call log
    await callRejected(webRTCStore.getVideoCallContactName);
    chatStore.loadCallLogs(await getCallLogs());
    await sechatApp.clearVideoCallNotifications();
  };

  const videoCallRejected = async (data: IStringMessage) => {
    console.warn(`Call rejected by: ${data.message}`);
    stopCalling();

    chatStore.loadCallLogs(await getCallLogs());
    webRTCStore.cleanup();
    webRTCStore.$reset();
    appStore.showErrorSnackbar(`Call rejected by ${data.message}`);
  };

  // Call terminated

  const terminateVideoCall = (data: string) => {
    console.log("Sending video call termination", data);
    signalRStore.connection.send(SignalRHubMethods.TerminateVideoCall, {
      message: data,
    });
  };

  const videoCallTerminated = async (data: IStringMessage) => {
    console.warn(`Call terminated by: ${data.message}`);

    if (webRTCStore.videoCallWaitingForApproval) {
      appStore.showWarningSnackbar(`Call ended by ${data.message}`);
    }

    chatStore.loadCallLogs(await getCallLogs());
    webRTCStore.cleanup();
    webRTCStore.$reset();
  };

  // Video Call Events

  const onWebRTCAnswerIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting WebRTCAnswerIncoming");
    connection.on(SignalRHubMethods.WebRTCAnswerIncoming, answerIncoming);
  };

  const onWebRTCScreenShareStateChangeEvent = (
    connection: signalR.HubConnection
  ) => {
    console.log("Connecting WebRTCScreenSahreStateChange");
    connection.on(
      SignalRHubMethods.ScreenShareStateChanged,
      screenShareToggledByOtherUser
    );
  };

  const onWebRTCOfferIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting WebRTCOfferIncoming");
    connection.on(SignalRHubMethods.WebRTCOfferIncoming, offerIncoming);
  };

  const onVideoCallTerminatedEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting VideoCallTerminatedEvent");
    connection.on(SignalRHubMethods.VideoCallTerminated, videoCallTerminated);
  };

  const onVideoCallApprovedEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting VideoCallApprovedEvent");
    connection.on(SignalRHubMethods.VideoCallApproved, videoCallApproved);
  };

  const onVideoCallRejectedEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting VideoCallRejectedEvent");
    connection.on(SignalRHubMethods.VideoCallRejected, videoCallRejected);
  };

  const onVideoCallRequestedEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting VideoCallRequestedEvent");
    connection.on(
      SignalRHubMethods.VideoCallRequested,
      videoCallRequestReceived
    );
  };

  const onICECandidateIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("Connecting ICECandidateIncoming");
    connection.on(SignalRHubMethods.ICECandidateIncoming, ICECandidateIncoming);
  };

  return {
    callLogsViewed,
    getCallLogs,
    registerCall,
    callAnswered,
    callRejected,
    onWebRTCScreenShareStateChangeEvent,
    toggleScreenShare,
    onWebRTCAnswerIncomingEvent,
    onWebRTCOfferIncomingEvent,
    onICECandidateIncomingEvent,
    onVideoCallTerminatedEvent,
    onVideoCallApprovedEvent,
    onVideoCallRejectedEvent,
    onVideoCallRequestedEvent,
    sendICECandiadate,
    terminateVideoCall,
    rejectVideoCall,
    sendVideoCallApproved: approveVideoCall,
    videoCallApproved,
    videoCallRejected,
    toggleCamera,
    toggleMicrophone,
    initializeCall,
    approveCall,
  };
};
