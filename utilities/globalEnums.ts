export const SnackbarIcons = {
  Warning: "mdi-alert",
  Success: "mdi-check-circle",
  Error: "mdi-alert-octagram",
  Info: "mdi-information-outline",
  Offline: "mdi-web-off",
  Disconnected: "broadcast-off",
};

export const SnackbarMessages = {
  Warning: "Hmm, check it for sure",
  Success: "Consider it done :)",
  Error: "Something went wrong :/",
};

export const CustomCookies = {
  GDPR: "gdpr-consent",
};

export const VisibilityStates = {
  VISIBLE: "visible",
  HIDDEN: "hidden",
};

export const SignalRState = {
  Connected: "Connected",
  Disconnected: "Disconnected",
  Connecting: "Connecting",
  Offline: "Offline",
};

export const ChatViews = {
  Messages: "messages",
  Rooms: "rooms",
  Contacts: "contacts",
  Settings: "settings",
};

export const PushNotificationTypes = {
  NewMessage: "New Message",
  NewContactRequest: "Contact Request",
};

export const VideoCallStatus = {
  Answered: "Answered",
  Initialized: "Initialized",
  None: "None",
};

export const VideoCodecs = {
  webm9MimeCodec: 'video/webm;codecs="vp8,opus"',
  webmOpusCodec: "video/webm;audio/webm;codecs=opus",
};

export const SignalRHubMethods = {
  // Chat Messages

  MessageWasViewed: "MessageWasViewed",
  MessagesWereViewed: "MessagesWereViewed",
  MessageIncoming: "MessageIncoming",

  // Video Calls

  SendWebRTCExchangeCompleted: "SendWebRTCExchangeCompleted",
  VideoCallRequest: "VideoCallRequest",
  SendWebRTCAnswer: "SendWebRTCAnswer",
  SendWebRTCOffer: "SendWebRTCOffer",
  SendICECandidate: "SendICECandidate",
  ApproveVideoCall: "ApproveVideoCall",
  TerminateVideoCall: "TerminateVideoCall",
  SendVideoCallData: "SendVideoCallData",
  RejectVideoCall: "RejectVideoCall",

  // Events

  WebRTCExchangeCompleted: "WebRTCExchangeCompleted",
  WebRTCOfferIncoming: "WebRTCOfferIncoming",
  WebRTCAnswerIncoming: "WebRTCAnswerIncoming",
  ICECandidateIncoming: "ICECandidateIncoming",
  VideoCallTerminated: "VideoCallTerminated",
  VideoCallRequested: "VideoCallRequested",
  VideoCallApproved: "VideoCallApproved",
  VideoCallRejected: "VideoCallRejected",

  // Chat Rooms

  ConnectToRooms: "ConnectToRooms",
  ConnectToRoom: "ConnectToRoom",
  CreateRoom: "CreateRoom",
  RoomDeleted: "RoomDeleted",
  UserAddedToRoom: "UserAddedToRoom",
  UserRemovedFromRoom: "UserRemovedFromRoom",
  DisconnectFromRoom: "DisconnectFromRoom",
  RoomUpdated: "RoomUpdated",

  // Contacts

  ConnectionRequestReceived: "ConnectionRequestReceived",
  ConnectionDeleted: "ConnectionDeleted",
  ConnectionUpdated: "ConnectionUpdated",
};

export const Servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
  ],
};

export const VideoSettings = {
  video: {
    width: { min: 320, ideal: 1920, max: 1920 },
    height: { min: 240, ideal: 1080, max: 1080 },
  },
  audio: true,
};
