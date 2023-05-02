import { SignalRHubMethods, VideoSettings } from "~/utilities/globalEnums";

export const useVideoCall = () => {
  const signalRStore = useSignalRStore();
  const sechatChatStore = useSechatChatStore();
  const appStore = useSechatAppStore();
  const webRTCStore = useWebRTCStore();

  const initializeCall = async () => {
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
    webRTCStore.updateVideoCallRequestSent(true);
    webRTCStore.updateSourcePlayerVisible(true);

    console.warn("--> Local Player", webRTCStore.localVideo);
    console.warn("--> Remote Player", webRTCStore.remoteVideo);
  };

  const approveCall = () => {
    webRTCStore.updateVideoCallWaitingForApproval(false);
    approveVideoCall({
      message: webRTCStore.getVideoCallContact.displayName,
    });
  };

  const videoCallRequestReceived = (data: IStringMessage) => {
    let contact = sechatChatStore.getContacts.find(
      (c) => c.displayName === data.message
    );
    console.warn(`--> Video call requested received: ${contact?.displayName}`);

    webRTCStore.updateVideoCallWaitingForApproval(true);
    webRTCStore.updateVideoCallViewVisible(true);
    webRTCStore.updateVideoCallContact(contact);
  };

  // Handle Incoming Offer
  const offerIncoming = async (data: IStringMessageForUser) => {
    console.warn(
      "--> Offer Incoming, creating answer",
      data.username,
      JSON.parse(data.message)
    );

    await createPeerConnection(data.username);
    await webRTCStore.peerConnection.setRemoteDescription(
      JSON.parse(data.message)
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

    if (!webRTCStore.peerConnection.currentRemoteDescription) {
      console.warn("--> Setting remote description...");
      webRTCStore.peerConnection.setRemoteDescription(JSON.parse(data.message));
    }

    console.warn("--> Answer added...");
    webRTCStore.updateVideoCallEstablished(true);
    webRTCStore.updateTargetPlayerVisible(true);
  };

  // TODO: there is an issue with candidates and remote description, wire up webrtc exchange completed
  const ICECandidateIncoming = (data: IStringMessage) => {
    if (
      webRTCStore.peerConnection &&
      webRTCStore.peerConnection.remoteDescription
    ) {
      console.warn("--> ICE Candidate being added!", JSON.parse(data.message));
      webRTCStore.peerConnection.addIceCandidate(JSON.parse(data.message));
      return;
    }
    console.error("--> peerConnection not ready!");
  };

  const createPeerConnection = async (userName: string) => {
    console.log("--> Creating peer connection", userName);
    webRTCStore.createPeerConnection();

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

    console.log("--> ICE Candidates Event");
    // TODO: push those to buffer and send when the cycle is completed
    webRTCStore.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        webRTCStore.addIceCandidate({
          username: userName,
          message: JSON.stringify(event.candidate),
        });
        // sendICECandiadate({
        //   username: userName,
        //   message: JSON.stringify(event.candidate),
        // });
      }
    };
  };

  const createAndSendOffer = async (userName: string) => {
    console.log("--> Creating and senting offer", userName);
    await createPeerConnection(userName);

    let offer = await webRTCStore.peerConnection.createOffer();
    await webRTCStore.peerConnection.setLocalDescription(offer);
    sendWebRTCOffer({
      username: userName,
      message: JSON.stringify(offer),
    });
  };

  const toggleCamera = () => {};

  const toggleMic = () => {};

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
    webRTCStore.cleanup();
    webRTCStore.$reset();
    appStore.showWarningSnackbar(`Call ended by ${data.message}`);
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
    createPeerConnection,
    toggleCamera,
    toggleMic,
    initializeCall,
    approveCall,
  };
};
