interface IRoomKey {
  roomName?: string;
  roomId?: string;
  key?: string;
}

interface IMessageToDecrypt {
  id?: number;
  text?: string;
  roomId?: string;
}
