export const useChatStore = () => {
  const userData = useUserData();

  const ChatViews = {
    Messages: "messages",
    Rooms: "rooms",
    Settings: "settings",
  };

  const availableRooms = useState<IRoom[]>("availableRooms", () => {
    return [];
  });
  const availableConnections = useState<IConnectionRequest[]>(
    "availableConnections",
    () => {
      return [];
    }
  );
  const activeChatTab = useState<string>("activeChatTab", () => "");
  const activeRoomId = useState<string>("activeChatRoom", () => "");

  const getActiveRoom = computed(() => {
    return getRooms.value.find((r) => r.id === activeRoomId.value);
  });

  const getRooms = computed(() => {
    return availableRooms.value;
  });

  const getConnections = computed(() => {
    return availableConnections.value;
  });

  // User Connections

  const handleConnectionRequestReceived = (data: IConnectionRequest) => {
    console.warn("--> Connection Request Received", data);
    if (data.invitedName === userData.userProfile.value.userName) {
      data.displayName = data.inviterName;
    } else {
      data.displayName = data.invitedName;
    }

    availableConnections.value = [...availableConnections.value, data].sort(
      (a, b) => a.invitedName.localeCompare(b.invitedName)
    );
  };

  const handleConnectionDelete = (message: IResourceNumericId) => {
    console.warn("--> Connection Delete Event", message);
    availableConnections.value = getConnections.value.filter(
      (uc) => uc.id !== message.id
    );
  };

  const handleUserConnectionChange = (data: IConnectionRequest) => {
    console.log("--> User Connection change Event");
    if (data.invitedName === userData.userProfile.value.userName) {
      data.displayName = data.inviterName;
    } else {
      data.displayName = data.invitedName;
    }

    availableConnections.value = [
      ...availableConnections.value.filter((uc) => uc.id !== data.id),
      data,
    ].sort((a, b) => a.invitedName.localeCompare(b.invitedName));
  };

  const loadUserConnections = (data: IConnectionRequest[]) => {
    console.log("--> Adding user connecitons to the Store", data);
    data.forEach((uc) => {
      if (uc.invitedName === userData.userProfile.value.userName) {
        uc.displayName = uc.inviterName;
      } else {
        uc.displayName = uc.invitedName;
      }
    });
    availableConnections.value = data;
  };

  // Rooms

  const addRoom = (room: IRoom) => {
    console.log("--> Adding room to the Store", room.name);
    getRooms.value.push(room);
  };

  const handleDeleteRoom = (message: IRoomIdMessage) => {
    console.warn("--> Handling Room Delete", message);
    if (activeRoomId.value === message.roomId) {
      activeRoomId.value = "";
    }
    availableRooms.value = getRooms.value.filter(
      (r) => r.id !== message.roomId
    );
  };

  const loadRooms = (data: IRoom[]) => {
    console.log("--> Adding room to the Store", data);
    availableRooms.value = data;
    sortRooms();
  };

  const clearRooms = () => {
    console.log("--> Removing all rooms  from the Store");
    availableRooms.value = [];
  };

  const sortRooms = () => {
    availableRooms.value = getRooms.value.sort(function (a, b) {
      return a.lastActivity < b.lastActivity
        ? 1
        : a.lastActivity > b.lastActivity
        ? -1
        : 0;
    });
  };

  const selectRoom = (room: IRoom) => {
    console.log("--> Room selected", room);
    if (!activeRoomId.value) {
      activeRoomId.value = room.id;
      activeChatTab.value = ChatViews.Messages;
      return;
    }
    if (room.id == activeRoomId.value) {
      activeRoomId.value = null;
      return;
    }
    activeRoomId.value = room.id;
    activeChatTab.value = ChatViews.Messages;
  };

  // Messages

  const handleIncomingMessage = (message: IMessage) => {
    console.warn("--> Incoming Message", message);
    const updatedRoom = getRooms.value.find((r) => r.id === message.roomId);
    updatedRoom.messages = [message, ...updatedRoom.messages].sort((a, b) =>
      a < b ? 1 : -1
    );
    updatedRoom.lastActivity = message.created;
  };

  return {
    getRooms,
    activeChatTab,
    activeRoomId,
    getActiveRoom,
    getConnections,
    addRoom,
    clearRooms,
    loadRooms,
    sortRooms,
    selectRoom,
    handleIncomingMessage,
    handleDeleteRoom,
    handleConnectionRequestReceived,
    handleUserConnectionChange,
    loadUserConnections,
    handleConnectionDelete,
  };
};
