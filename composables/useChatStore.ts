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
    data.forEach((r) => (r.selected = false));
    rooms.value = data;
  };

  const clearRooms = () => {
    console.log("--> Removing all rooms  from the Store");
    rooms.value = [];
  };

  return { rooms, addRoom, clearRooms, loadRooms, activeChatTab, activeRoom };
};
