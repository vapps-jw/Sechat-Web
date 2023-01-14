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
  created?: Date;
}

interface IMemeber {
  id?: string;
  userName?: string;
  lastActivity?: Date;
}

interface ISentMessage {
  senderId?: string;
  text?: string;
  roomId?: string;
}
