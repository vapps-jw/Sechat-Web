interface IRoomData {
  keys: IRoomKey[];
}

interface IRoomKey {
  roomName?: string;
  roomId?: string;
  key?: string;
}
