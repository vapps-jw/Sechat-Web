interface IResourceGuid {
  id?: string;
}

interface IResourceId {
  id?: number;
}

interface IStringMessage {
  message?: string;
}

interface IUserRoomOptions {
  roomId?: string;
  userName?: string;
}

interface INewRoomCreateMessage {
  id?: string;
  name?: string;
  owner?: string;
  ownerName?: string;
  lastActivity?: Date;
  created?: Date;
}

interface IRoom {
  id?: string;
  name?: string;
  messages?: IMessage[];
  members?: IMemeber[];
  creatorName?: string;
  lastActivity?: Date;
  created?: Date;
}

interface IMessage {
  id?: number;
  nameSentBy?: string;
  text?: string;
  roomId?: string;
  created?: Date;
  messageViewers?: IMessageViewer[];
  wasViewed?: boolean;
}

interface IMessageViewer {
  user?: string;
}

interface IMemeber {
  userName?: string;
  lastActivity?: Date;
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
  approved?: boolean;
  displayName?: string;
  blocked?: boolean;
  blockedByName?: string;
}
