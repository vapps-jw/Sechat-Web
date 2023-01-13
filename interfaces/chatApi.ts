interface INewRoomCreateMessage {
  id?: string;
  name?: string;
  owner?: string;
  ownerName?: string;
  lastActivity?: Date;
  created?: Date;
}

interface IRoom {
  id?: number;
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
