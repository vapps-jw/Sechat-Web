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
};

export const SignalRHubMethods = {
  MessageWasViewed: "MessageWasViewed",
  MessagesWereViewed: "MessagesWereViewed",
  TerminateVideoCall: "TerminateVideoCall",
  VideoCallTerminated: "VideoCallTerminated",
  ApproveVideoCall: "ApproveVideoCall",
  RejectVideoCall: "RejectVideoCall",
  VideoCallRequest: "VideoCallRequest",
  VideoCallApproved: "VideoCallApproved",
  VideoCallRejected: "VideoCallRejected",
  VideoCallRequested: "VideoCallRequested",
  VideoCallDataIncoming: "VideoCallDataIncoming",
  SendVideoCallData: "SendVideoCallData",
  ConnectToRooms: "ConnectToRooms",
  ConnectToRoom: "ConnectToRoom",
  CreateRoom: "CreateRoom",
  MessageIncoming: "MessageIncoming",
  RoomDeleted: "RoomDeleted",
  ConnectionRequestReceived: "ConnectionRequestReceived",
  ConnectionDeleted: "ConnectionDeleted",
  ConnectionUpdated: "ConnectionUpdated",
  UserAddedToRoom: "UserAddedToRoom",
  UserRemovedFromRoom: "UserRemovedFromRoom",
  DisconnectFromRoom: "DisconnectFromRoom",
  RoomUpdated: "RoomUpdated",
};
