import { SignalRHubMethods, LocalStoreTypes } from "~~/utilities/globalEnums";

export const useE2EHandlers = () => {
  const chatStore = useSechatChatStore();
  const signalRStore = useSignalRStore();
  const e2e = useE2Encryption();

  const onDMKeyRequested = async (connection: signalR.HubConnection) => {
    connection.on(
      SignalRHubMethods.DMKeyRequested,
      async (message: DMKeyRequest) => {
        console.warn("Incoming DMKeyRequested ", message);

        const key = e2e.getKey(message.id, LocalStoreTypes.E2EDM);
        if (!key) {
          console.log("Key not found");
          return;
        }

        const keyToShare: DMSharedKey = {
          key: key.key,
          receipient: message.receipient,
          id: message.id,
        };

        console.log("Sending DM key", keyToShare);
        signalRStore.connection.send(SignalRHubMethods.ShareDMKey, keyToShare);
      }
    );
  };

  const onDMKeyIncoming = async (connection: signalR.HubConnection) => {
    connection.on(
      SignalRHubMethods.DMKeyIncoming,
      async (message: DMSharedKey) => {
        console.warn("Incoming DMKeyIncoming ", message);

        const newKey: E2EKey = {
          key: message.key,
          id: message.id,
        };

        console.log("Updating key", newKey);
        const result = e2e.addKey(newKey, LocalStoreTypes.E2EDM);
        console.log("Key Updated", result);

        const contact = chatStore.availableContacts.find(
          (c) => c.id === message.id
        );
        e2e.tryDecryptContact(contact);
      }
    );
  };

  const onRoomKeyRequested = async (connection: signalR.HubConnection) => {
    connection.on(
      SignalRHubMethods.RoomKeyRequested,
      (message: RoomKeyRequest) => {
        console.warn("Room Key requested");

        const key = e2e.getKey(message.id, LocalStoreTypes.E2EROOMS);
        if (!key) {
          console.log("Key not found");
          return;
        }

        const keyToShare: RoomSharedKey = {
          key: key.key,
          receipient: message.receipient,
          id: message.id,
        };

        console.log("Sending Room key", keyToShare);
        signalRStore.connection.send(
          SignalRHubMethods.ShareRoomKey,
          keyToShare
        );
      }
    );
  };

  const onRoomKeyIncoming = async (connection: signalR.HubConnection) => {
    connection.on(
      SignalRHubMethods.RoomKeyIncoming,
      (message: RoomSharedKey) => {
        console.warn("Room Key received", message);

        const newKey: E2EKey = {
          key: message.key,
          id: message.id,
        };

        const result = e2e.addKey(newKey, LocalStoreTypes.E2EROOMS);
        console.log("Key Updated", result);

        const room = chatStore.availableRooms.find((c) => c.id === message.id);
        e2e.tryDecryptRoom(room);
      }
    );
  };

  return {
    onRoomKeyRequested,
    onRoomKeyIncoming,
    onDMKeyIncoming,
    onDMKeyRequested,
  };
};
