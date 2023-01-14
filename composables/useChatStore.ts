export const useChatStore = () => {
  const rooms = useState<IRoom[]>("availableRooms", () => {
    return [];
  });
  const activeChatTab = useState<string>("activeChatTab", () => "");
  const activeRoom = useState<string>("activeChatRoom", () => "");

  const addRoom = (room: IRoom) => {
    console.log("--> Adding room to the Store", room.name);
    rooms.value.push(room);
  };

  const loadRooms = (data: IRoom[]) => {
    console.log("--> Adding room to the Store", data);
    rooms.value = data;
    sortRooms();
  };

  const clearRooms = () => {
    console.log("--> Removing all rooms  from the Store");
    rooms.value = [];
  };

  const sortRooms = () => {
    rooms.value = rooms.value.sort(function (a, b) {
      return a.lastActivity > b.lastActivity
        ? 1
        : a.lastActivity < b.lastActivity
        ? -1
        : 0;
    });
  };

  const selectRoom = (room: IRoom) => {
    activeRoom.value = room.id;
  };

  return {
    rooms,
    activeChatTab,
    activeRoom,
    addRoom,
    clearRooms,
    loadRooms,
    sortRooms,
    selectRoom,
  };
};
