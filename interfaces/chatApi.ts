interface IResourceGuid {
  id?: string;
}

interface IMessageDecryptionRequest {
  id?: number;
  message?: string;
  roomId?: string;
  error?: boolean;
}

interface IResourceId {
  id?: number;
}

interface IStringMessage {
  message?: string;
}

interface IStringUserMessage {
  userName?: string;
  message?: string;
}

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
  encryptedByUser?: boolean;
  hasKey?: boolean;
}

interface IRoomMessageUserActionMessage {
  roomId?: string;
  userName?: string;
  messageId?: number;
}

interface IRoomUserActionMessage {
  roomId?: string;
  userName?: string;
}

interface IMessage {
  id?: number;
  nameSentBy?: string;
  text?: string;
  roomId?: string;
  created?: Date;
  messageViewers?: IMessageViewer[];
  wasViewed?: boolean;
  error?: boolean;
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

interface ISentMessage {
  text?: string;
  roomId?: string;
}
interface IChatState {
  rooms?: IRoom[];
  userContacts?: IContactRequest[];
}

interface IRoomUpdate {
  text?: string;
  roomId?: string;
}

interface IContactRequest {
  id?: number;
  inviterName?: string;
  invitedName?: string;
  contactState?: string;
  approved?: boolean;
  displayName?: string;
  blocked?: boolean;
  blockedByName?: string;
}

interface ILinkPreview {
  title?: string;
  description?: string;
  domain?: string;
  img?: string;
  favicon?: string;
}
