export const useChatStore = () => {
  const ChatViews = {
    Messages: "messages",
    Rooms: "rooms",
    Settings: "settings",
  };

  const availableRooms = useState<IRoom[]>("availableRooms", () => {
    return [];
  });
  const activeChatTab = useState<string>("activeChatTab", () => "");
  const activeRoomId = useState<string>("activeChatRoom", () => "");

  const activeRoom = computed(() => {
    return rooms.value.find((r) => r.id === activeRoomId.value);
  });

  const rooms = computed(() => {
    return availableRooms.value;
  });

  const addRoom = (room: IRoom) => {
    console.log("--> Adding room to the Store", room.name);
    rooms.value.push(room);
  };

  const handleConnectionRequestReceived = (
    connectionRequest: IConnectionRequest
  ) => {
    console.warn("--> Connection Request Received", connectionRequest);
  };

  const handleUserConnectionChange = () => {
    console.log("--> User Connection change");
  };

  const handleIncomingMessage = (message: IMessage) => {
    console.warn("--> Incoming Message", message);
    const updatedRoom = rooms.value.find((r) => r.id === message.roomId);
    updatedRoom.messages = [message, ...updatedRoom.messages].sort((a, b) =>
      a < b ? 1 : -1
    );
    updatedRoom.lastActivity = message.created;
  };

  const handleDeleteRoom = (message: IRoomIdMessage) => {
    if (activeRoomId.value === message.roomId) {
      activeRoomId.value = "";
    }
    availableRooms.value = rooms.value.filter((r) => r.id !== message.roomId);
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
    availableRooms.value = rooms.value.sort(function (a, b) {
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

  return {
    rooms,
    activeChatTab,
    activeRoomId,
    activeRoom,
    addRoom,
    clearRooms,
    loadRooms,
    sortRooms,
    selectRoom,
    handleIncomingMessage,
    handleDeleteRoom,
    handleConnectionRequestReceived,
    handleUserConnectionChange,
  };
};
