// Abstractions

interface IStringUserMessage {
  userName?: string;
  message?: string;
}
interface IResourceGuid {
  id?: string;
}

interface IResourceId {
  id?: number;
}

interface IStringMessage {
  message?: string;
}

interface IMessageBase {
  id?: number;
  nameSentBy?: string;
  text?: string;
  created?: Date;
  wasViewed?: boolean;
  error?: boolean;
}

// Video Calls

interface ICallLog {
  id?: number;
  created?: Date;
  calleeName?: string;
  phonerName?: string;
  wasViewed?: boolean;
  videoCallType?: string;
  videoCallResult?: string;
}

// Messages

interface IDirectMessageId {
  id?: number;
  contactId?: number;
}
interface IDirectMessage extends IMessageBase {
  contactId?: number;
  decrypted?: boolean;
}

interface IDirectMessagesViewed {
  contactId?: number;
}

interface IMessage extends IMessageBase {
  roomId?: string;
  decrypted?: boolean;
  messageViewers?: IMessageViewer[];
}

// Link Previews

interface ILinkPreview {
  title?: string;
  description?: string;
  domain?: string;
  img?: string;
  favicon?: string;
}

// Rooms

interface IRoomCreateRequest {
  roomName?: string;
  userEncrypted?: boolean;
  userKey?: string;
}

interface IUserRoomOptions {
  roomId?: string;
  userName?: string;
}

interface IRoom {
  id?: string;
  name?: string;
  messages?: IMessage[];
  members?: IRoomMemeber[];
  creatorName?: string;
  lastActivity?: Date;
  created?: Date;
  hasKey?: boolean;
}

interface IRoomMessageUserActionMessage {
  roomId?: string;
  userName?: string;
  messageId?: number;
}

interface IContactMessageUserActionMessage {
  contactId?: number;
  messageId?: number;
}

interface IMessageDeleted {
  id?: number;
  roomId?: string;
}

interface IDirectMessageDeleted {
  id?: number;
  contactId?: number;
}

interface IRoomUserActionMessage {
  roomId?: string;
  userName?: string;
}

interface IMessageViewer {
  user?: string;
}

interface IRoomMemeber {
  userName?: string;
  lastActivity?: Date;
}

interface IRoomUpdateRequest {
  roomId?: string;
  lastMessage?: number;
}

interface IRoomUpdate {
  text?: string;
  roomId?: string;
}

interface IMessageDecryptionRequest {
  id?: number;
  message?: string;
  roomId?: string;
  error?: boolean;
}

interface IDirectMessageDecryptionRequest {
  id?: number;
  message?: string;
  contactId?: string;
  error?: boolean;
}

// Contacts

interface IContactUpdateRequest {
  contactId?: number;
  lastMessage?: number;
}

interface IContactUpdateRequired {
  contactId?: number;
}

interface IContactRequest {
  id?: number;
  inviterName?: string;
  invitedName?: string;
  contactState?: string;
  approved?: boolean;
  displayName?: string;
  verified?: boolean;
  blocked?: boolean;
  blockedByName?: string;
  directMessages?: IDirectMessage[];
  hasKey?: boolean;
}
