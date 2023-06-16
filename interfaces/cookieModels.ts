interface IRoomData {
  keys: IRoomKey[];
}

interface IRoomKey {
  roomId?: string;
  key?: string;
  salt?: string;
}
