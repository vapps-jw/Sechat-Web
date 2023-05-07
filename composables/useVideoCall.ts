import { SignalRHubMethods, VideoSettings } from "~/utilities/globalEnums";

export const useVideoCall = () => {
  const signalRStore = useSignalRStore();
  const sechatChatStore = useSechatChatStore();
  const appStore = useSechatAppStore();
  const webRTCStore = useWebRTCStore();

  const getICECandidates = async () => {
    const { data: servers, error: apiError } = await (<any>(
      useFetch("/api/webRTC/turn")
    ));
    if (apiError.value) {
      console.error("--> TURN Error", apiError.value.data);
      return;
    }

    console.log(
      "--> Final ICE List",
      JSON.parse(JSON.stringify(servers.value))
    );
    return servers.data;
  };

  const initializeCall = async () => {
    webRTCStore.updateVideoCallRequestSent(true);

    const localStream = await navigator.mediaDevices.getUserMedia(
      VideoSettings
    );
    webRTCStore.updateLocalStream(localStream);
    console.warn("--> Local Stream check", webRTCStore.localStream);
    webRTCStore.addLocalStreamToPlayer();

    console.warn(
      "--> Sending call request",
      webRTCStore.getVideoCallContactName
    );
    signalRStore.connection.send(SignalRHubMethods.VideoCallRequest, {
      message: webRTCStore.getVideoCallContactName,
    });

    webRTCStore.updateSourcePlayerVisible(true);

    console.warn("--> Local Player", webRTCStore.localVideo);
    console.warn("--> Remote Player", webRTCStore.remoteVideo);
  };

  const approveCall = () => {
    webRTCStore.updateVideoCallWaitingForApproval(false);
    webRTCStore.updateVideoCallEstablished(true);
    approveVideoCall({
      message: webRTCStore.getVideoCallContact.displayName,
    });
  };

  const videoCallRequestReceived = (data: IStringMessage) => {
    let contact = sechatChatStore.getContacts.find(
      (c) => c.displayName === data.message
    );
    console.warn(`--> Video call requested received: ${contact?.displayName}`);

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
  const offerIncoming = async (data: IStringMessageForUser) => {
    console.warn(
      "--> Offer Incoming, creating answer",
      data.userName,
      JSON.parse(data.message)
    );

    await createPeerConnection(data.userName);
    webRTCStore.peerConnection
      .setRemoteDescription(JSON.parse(data.message))
      .then(() => {
        webRTCStore.readyToReceiveCandidates = true;
        console.log("--> Remote description set");
        return Promise.all(
          webRTCStore.iceCandidatesBuffer.map((c) =>
            webRTCStore.peerConnection.addIceCandidate(c)
          )
        );
      })
      .then(() => {
        console.log("--> All stored candidates added");
        webRTCStore.iceCandidatesBuffer.length = 0;
      })
      .catch((err) =>
        console.error("--> Error when adding ICE candidates", err)
      );

    let answer = await webRTCStore.peerConnection.createAnswer();
    await webRTCStore.peerConnection.setLocalDescription(answer);

    const answerToSend = {
      username: webRTCStore.getVideoCallContactName,
      message: JSON.stringify(answer),
    };

    console.warn("--> Sending answer", answerToSend);
    sendWebRTCAnswer(answerToSend);
  };

  // Handle Incoming Answer
  const answerIncoming = (data: IStringMessageForUser) => {
    console.warn("--> Answer Incoming", JSON.parse(data.message));

    console.warn("--> Setting remote description...");
    webRTCStore.peerConnection
      .setRemoteDescription(JSON.parse(data.message))
      .then(() => {
        webRTCStore.readyToReceiveCandidates = true;
        console.log(
          "--> Remote description set, candidates in buffer:",
          webRTCStore.iceCandidatesBuffer.length
        );
        return Promise.all(
          webRTCStore.iceCandidatesBuffer.map((c) =>
            webRTCStore.peerConnection.addIceCandidate(c)
          )
        );
      })
      .then(() => {
        console.log("--> All stored candidates added");
        webRTCStore.iceCandidatesBuffer.length = 0;
      })
      .catch((err) =>
        console.error("--> Error when adding ICE candidates", err)
      );

    console.warn("--> Answer added...");
    webRTCStore.updateVideoCallEstablished(true);
    webRTCStore.updateTargetPlayerVisible(true);
  };

  const ICECandidateIncoming = (data: IStringMessage) => {
    console.warn("--> ICE Candidate Incoming!", JSON.parse(data.message));
    if (webRTCStore.readyToReceiveCandidates) {
      console.warn("--> ICE Candidate being added!", JSON.parse(data.message));
      webRTCStore.peerConnection.addIceCandidate(JSON.parse(data.message));
    } else {
      console.warn(
        "--> ICE Candidate being added to buffer!",
        JSON.parse(data.message)
      );
      webRTCStore.iceCandidatesBuffer.push(JSON.parse(data.message));
    }
  };

  const createPeerConnection = async (userName: string) => {
    console.log("--> Creating peer connection", userName);

    const servers = await getICECandidates();
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

    console.log("--> Checking local stream", webRTCStore.localStream);
    console.log("--> Checking remote stream", webRTCStore.remoteStream);

    console.log("--> Getting tracks", webRTCStore.localStream);
    webRTCStore.localStream.getTracks().forEach((track) => {
      webRTCStore.peerConnection.addTrack(track, webRTCStore.localStream);
    });

    webRTCStore.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        webRTCStore.remoteStream.addTrack(track);
      });
    };

    webRTCStore.peerConnection.onconnectionstatechange = (e) => {
      // TODO: handle connection failed
      console.warn(
        "--> Connection state change",
        webRTCStore.peerConnection.connectionState
      );

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
        console.warn("--> Sending ICE Candidate to", userName);
        sendICECandiadate({
          userName: userName,
          message: JSON.stringify(event.candidate),
        });
      }
    };
  };

  const createAndSendOffer = async (userName: string) => {
    console.log("--> Creating and senting offer", userName);
    await createPeerConnection(userName);

    let offer = await webRTCStore.peerConnection.createOffer();
    await webRTCStore.peerConnection.setLocalDescription(offer);
    sendWebRTCOffer({
      userName: userName,
      message: JSON.stringify(offer),
    });
  };

  const toggleCamera = () => {
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

  // WebRTC

  const sendICECandiadate = (data: IStringMessageForUser) => {
    signalRStore.connection.send(SignalRHubMethods.SendICECandidate, data);
  };

  const sendWebRTCOffer = (data: IStringMessageForUser) => {
    console.warn("--> Sending WebRTC Offer", data);
    signalRStore.connection.send(SignalRHubMethods.SendWebRTCOffer, data);
  };

  const sendWebRTCAnswer = (data: IStringMessageForUser) => {
    signalRStore.connection.send(SignalRHubMethods.SendWebRTCAnswer, data);
  };

  // Call approved

  const approveVideoCall = (data: IStringMessageForUser) => {
    console.log("--> Sending video call approved", data);
    signalRStore.connection.send(SignalRHubMethods.ApproveVideoCall, data);
  };

  // Call Approved Sending Offer
  const videoCallApproved = (data: IStringMessage) => {
    console.warn(`--> Call approved by: ${data.message}`);
    let connection = sechatChatStore.getContacts.find(
      (c) => c.inviterName === data.message || c.invitedName === data.message
    );
    if (!connection) {
      return;
    }

    createAndSendOffer(connection.displayName);
    appStore.showSuccessSnackbar(`Call Answered by ${data.message}`);
  };

  // Call rejected

  const rejectVideoCall = (data: string) => {
    console.log("--> Sending video call rejection", data);
    signalRStore.connection.send(SignalRHubMethods.RejectVideoCall, {
      message: data,
    });
  };

  const videoCallRejected = (data: IStringMessage) => {
    console.warn(`--> Call rejected by: ${data.message}`);

    appStore.showErrorSnackbar(`Call rejected by ${data.message}`);
  };

  // Call terminated

  const terminateVideoCall = (data: string) => {
    console.log("--> Sending video call termination", data);
    signalRStore.connection.send(SignalRHubMethods.TerminateVideoCall, {
      message: data,
    });
  };

  const videoCallTerminated = (data: IStringMessage) => {
    console.warn(`--> Call terminated by: ${data.message}`);

    if (webRTCStore.videoCallWaitingForApproval) {
      appStore.showWarningSnackbar(`Call ended by ${data.message}`);
    }

    webRTCStore.cleanup();
    webRTCStore.$reset();
  };

  // Video Call Events

  const onWebRTCAnswerIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting WebRTCAnswerIncoming");
    connection.on(SignalRHubMethods.WebRTCAnswerIncoming, answerIncoming);
  };

  const offWebRTCAnswerIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting WebRTCAnswerIncoming");
    connection.off(SignalRHubMethods.WebRTCAnswerIncoming, answerIncoming);
  };

  const onWebRTCOfferIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting WebRTCOfferIncoming");
    connection.on(SignalRHubMethods.WebRTCOfferIncoming, offerIncoming);
  };

  const offWebRTCOfferIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting WebRTCOfferIncoming");
    connection.off(SignalRHubMethods.WebRTCOfferIncoming, offerIncoming);
  };

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
    connection.on(
      SignalRHubMethods.VideoCallRequested,
      videoCallRequestReceived
    );
  };

  const offVideoCallRequestedEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting VideoCallRequestedEvent");
    connection.off(
      SignalRHubMethods.VideoCallRequested,
      videoCallRequestReceived
    );
  };

  const onICECandidateIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("--> Connecting ICECandidateIncoming");
    connection.on(SignalRHubMethods.ICECandidateIncoming, ICECandidateIncoming);
  };

  const offICECandidateIncomingEvent = (connection: signalR.HubConnection) => {
    console.log("--> Disconnecting ICECandidateIncoming");
    connection.off(
      SignalRHubMethods.ICECandidateIncoming,
      ICECandidateIncoming
    );
  };

  return {
    onWebRTCAnswerIncomingEvent,
    onWebRTCOfferIncomingEvent,
    onICECandidateIncomingEvent,
    onVideoCallTerminatedEvent,
    onVideoCallApprovedEvent,
    onVideoCallRejectedEvent,
    onVideoCallRequestedEvent,
    offWebRTCAnswerIncomingEvent,
    offWebRTCOfferIncomingEvent,
    offICECandidateIncomingEvent,
    offVideoCallTerminatedEvent,
    offVideoCallApprovedEvent,
    offVideoCallRejectedEvent,
    offVideoCallRequestedEvent,
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
