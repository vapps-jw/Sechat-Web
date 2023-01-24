interface IResourceGuid {
  id?: string;
}

interface IResourceId {
  id?: number;
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
  creatorId?: string;
  lastActivity?: Date;
  created?: Date;
}

interface IMessage {
  id?: number;
  idSentBy?: string;
  nameSentBy?: string;
  text?: string;
  roomId?: string;
  created?: Date;
}

interface IMemeber {
  id?: string;
  userName?: string;
  lastActivity?: Date;
}

interface ISentMessage {
  text?: string;
  roomId?: string;
}
interface IChatState {
  rooms?: IRoom[];
  userConnections?: IConnectionRequest[];
}

interface IConnectionRequest {
  id?: number;
  inviterName?: string;
  invitedName?: string;
  approved?: boolean;
  displayName?: string;
  blocked?: boolean;
  blockedBy?: string;
}

x;
