type E2EKey = {
  id: number | string;
  key: string;
};

type E2EExtract = {
  masterKey: E2EKey;
  roomKeys: E2EKey[];
  dmKeys: E2EKey[];
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
  keyHolders: string[];
};

type MasterKeyRequest = {
  receipient: string;
  id: string;
};

type MasterSharedKey = {
  key: string;
  id: string | number;
};
