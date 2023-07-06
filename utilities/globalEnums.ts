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
  E2E: "E2E",
  E2EDM: "E2E_DM",
  GDPR: "gdpr-consent",
  AUTH: "sechatid",
};

export const LocalStorage = {
  E2E: "E2E",
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
  VideoCall: "Video Call",
};

export const VideoCallStatus = {
  Answered: "Answered",
  Initialized: "Initialized",
  None: "None",
};

export const ContactState = {
  Online: "Online",
  Offline: "Offline",
  Unknown: "Unknown",
};

export const VideoCodecs = {
  webm9MimeCodec: 'video/webm;codecs="vp8,opus"',
  webmOpusCodec: "video/webm;audio/webm;codecs=opus",
};

export const SignalRCustonMessages = {
  ScreenShareBusy: "ScreenShareBusy",
  ScreenShareFree: "ScreenShareFree",
};

export const VideoCallLogType = {
  Incoming: "Incoming",
  Outgoing: "Outgoing",
};

export const VideoCallLogResult = {
  Answered: "Answered",
  Rejected: "Rejected",
  Unanswered: "Unanswered",
};

export const SignalRHubMethods = {
  // Video Calls
  SendMicStateChange: "SendMicStateChange",
  SendCamStateChange: "SendCamStateChange",
  SendScreenShareStateChange: "SendScreenShareStateChange",
  SendWebRTCExchangeCompleted: "SendWebRTCExchangeCompleted",
  VideoCallRequest: "VideoCallRequest",
  SendWebRTCAnswer: "SendWebRTCAnswer",
  SendWebRTCOffer: "SendWebRTCOffer",
  SendICECandidate: "SendICECandidate",
  ApproveVideoCall: "ApproveVideoCall",
  TerminateVideoCall: "TerminateVideoCall",
  RejectVideoCall: "RejectVideoCall",

  // Events
  MicStateChanged: "MicStateChanged",
  CamStateChanged: "CamStateChanged",
  ScreenShareStateChanged: "ScreenShareStateChanged",
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
  ContactStateChanged: "ContactStateChanged",
  CheckOnlineState: "CheckOnlineState",
  ConnectionRequestReceived: "ConnectionRequestReceived",
  ConnectionDeleted: "ConnectionDeleted",
  ConnectionUpdated: "ConnectionUpdated",

  // Room Messages
  MessageWasViewed: "MessageWasViewed",
  MessagesWereViewed: "MessagesWereViewed",
  MessageIncoming: "MessageIncoming",
  MessageDeleted: "MessageDeleted",

  // Direct Messages
  DirectMessageIncoming: "DirectMessageIncoming",
  DirectMessagesWereViewed: "DirectMessagesWereViewed",
  DirectMessageWasViewed: "DirectMessageWasViewed",
  DirectMessageDeleted: "DirectMessageDeleted",
};

export const VideoSettings = {
  video: {
    width: { min: 320, ideal: 1920, max: 1920 },
    height: { min: 240, ideal: 1080, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
  },
  audio: true,
};

export const DisplayMediaSettings = {
  surfaceSwitching: "exclude",
  video: {
    frameRate: 30,
    width: 1920,
    height: 1080,
    cursor: "always",
  },
  audio: {
    autoGainControl: false,
    echoCancellation: false,
    googAutoGainControl: false,
    noiseSuppresion: false,
  },
};
