type e2eKey = {
  id: number | string;
  key: string;
};

type DMKeyRequest = {
  receipient: string;
  keyHolder: string;
  id: number;
};

type DMSharedKey = {
  receipient: string;
  key: string;
  id: number;
};

type RoomKeyRequest = {
  id: string;
};

type RoomSharedKey = {
  key: string;
  id: string;
};
