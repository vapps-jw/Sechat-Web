type E2EKey = {
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
  receipient: string;
  id: string;
};

type RoomSharedKey = {
  receipient: string;
  key: string;
  id: string;
};

type MissingKey = {
  type: string;
  id: string | number;
  keyHandlers: string[];
};
