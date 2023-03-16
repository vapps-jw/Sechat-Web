import { scrollToBottom } from "~~/utilities/documentFunctions";

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

  const activeChatTab = useState<string>(
    "activeChatTab",
    () => ChatViews.Messages
  );
  const activeRoomId = useState<string>("activeChatRoom", () => "");

  const getActiveRoom = computed(() => {
    return getRooms.value.find((r) => r.id === activeRoomId.value);
  });

  const getActiveRoomCreatorName = computed(() => {
    if (activeRoomId) {
      return getRooms.value.find((r) => r.id === activeRoomId.value)
        .creatorName;
    }
    return "";
  });

  const getActiveRoomMembers = computed(() => {
    if (!activeRoomId.value) {
      return [];
    }
    return getRooms.value.find((r) => r.id === activeRoomId.value).members;
  });

  const getRooms = computed(() => {
    return availableRooms.value;
  });

  const getConnections = computed(() => {
    return availableConnections.value;
  });

  const getApprovedConnections = computed(() => {
    const result = availableConnections.value.filter(
      (uc) => !uc.blocked && uc.approved
    );
    return result;
  });

  const getConnectionsAllowedForActiveRoom = computed(() => {
    if (!getActiveRoom.value) {
      return [];
    }
    return availableConnections.value.filter(
      (uc) =>
        !uc.blocked &&
        uc.approved &&
        uc.displayName !== userData.getUsername.value &&
        !getActiveRoom.value.members.some(
          (arm) => arm.userName === uc.displayName
        )
    );
  });

  const clearState = () => {
    console.warn("--> Clearing state");
    availableRooms.value = [];
    availableConnections.value = [];
    activeChatTab.value = "";
    activeRoomId.value = "";
  };

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

  const handleConnectionDelete = (resourceId: IResourceId) => {
    console.warn("--> Connection Delete Event Handled", resourceId);
    availableConnections.value = getConnections.value.filter(
      (uc) => uc.id !== resourceId.id
    );
  };

  const handleConnectionUpdated = (data: IConnectionRequest) => {
    console.log("--> User Connection Updated Event Handled", data);
    if (data.invitedName === userData.userProfile.value.userName) {
      data.displayName = data.inviterName;
    } else {
      data.displayName = data.invitedName;
    }

    availableConnections.value = [
      ...getConnections.value.filter((uc) => uc.id !== data.id),
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

  const handleUpdateRoom = (room: IRoom) => {
    console.warn("--> Handling Room Updated Event", room);
    room.messages = getActiveRoom.value.messages;

    availableRooms.value = [
      ...availableRooms.value.filter((uc) => uc.id !== room.id),
      room,
    ].sort((a, b) => Number(a.lastActivity) - Number(b.lastActivity));
  };

  const handleUserAddedToRoom = (room: IRoom) => {
    console.warn("--> Handling UserAddedToRoom Event", room);

    availableRooms.value = [...availableRooms.value, room].sort(
      (a, b) => Number(a.lastActivity) - Number(b.lastActivity)
    );
  };

  const handleUserRemovedFromRoom = (options: IUserRoomOptions) => {
    console.warn(
      "--> Handling UserRemovedFromRoom Event in Chat Store",
      options
    );

    if (userData.getUsername.value === options.userName) {
      console.warn("--> Active user is being removed - Chat Store");
      if (activeRoomId.value === options.roomId) {
        activeRoomId.value = "";
      }
      availableRooms.value = getRooms.value.filter(
        (r) => r.id !== options.roomId
      );
      return;
    }

    const roomToUpdate = availableRooms.value.find(
      (r) => r.id === options.roomId
    );
    roomToUpdate.members = roomToUpdate.members.filter(
      (rm) => rm.userName !== options.userName
    );
  };

  const handleDeleteRoom = (message: IResourceGuid) => {
    console.warn("--> Handling Room Delete Event Handled", message);
    if (activeRoomId.value === message.id) {
      activeRoomId.value = "";
    }
    availableRooms.value = getRooms.value.filter((r) => r.id !== message.id);
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
    availableRooms.value = availableRooms.value.sort(
      (a, b) => Number(a.lastActivity) - Number(b.lastActivity)
    );
  };

  const selectRoom = (room: IRoom) => {
    console.log("--> Room selected", room);
    if (!activeRoomId.value) {
      activeRoomId.value = room.id;
      activeChatTab.value = ChatViews.Messages;
      return;
    }
    activeRoomId.value = room.id;
    activeChatTab.value = ChatViews.Messages;
    scrollToBottom("chatView");
  };

  // Messages

  const handleIncomingMessage = (message: IMessage) => {
    console.warn("--> Incoming Message Event Handle", message);

    const roomToUpdate = availableRooms.value.find(
      (r) => r.id === message.roomId
    );

    roomToUpdate.messages.push(message);

    console.warn("--> Sorting Messages");
    roomToUpdate.messages = roomToUpdate.messages.sort(
      (a, b) => Number(a.created) - Number(b.created)
    );
    roomToUpdate.lastActivity = message.created;
    scrollToBottom("chatView");
  };

  return {
    getRooms,
    activeChatTab,
    activeRoomId,
    getActiveRoom,
    getConnections,
    getApprovedConnections,
    getActiveRoomMembers,
    getActiveRoomCreatorName,
    getConnectionsAllowedForActiveRoom,
    clearState,
    addRoom,
    clearRooms,
    loadRooms,
    sortRooms,
    selectRoom,
    handleUpdateRoom,
    handleIncomingMessage,
    handleDeleteRoom,
    handleConnectionRequestReceived,
    handleConnectionUpdated,
    loadUserConnections,
    handleConnectionDelete,
    handleUserAddedToRoom,
    handleUserRemovedFromRoom,
  };
};
