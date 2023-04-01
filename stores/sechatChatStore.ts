const ChatViews = {
  Messages: "messages",
  Rooms: "rooms",
  Settings: "settings",
};

export const useSechatChatStore = defineStore({
  id: "sechat-chat-store",
  state: () => {
    return {
      availableRooms: <IRoom[]>[],
      availableConnections: <IConnectionRequest[]>[],
      activeChatTab: <string>ChatViews.Rooms,
      activeRoomId: <string>"",
    };
  },
  actions: {
    addConnection(value: IConnectionRequest) {
      this.availableConnections = [
        ...this.availableConnections.value,
        value,
      ].sort((a, b) => a.invitedName.localeCompare(b.invitedName));
    },
    updateConnection(value: IConnectionRequest) {
      this.availableConnections = [
        ...this.availableConnections.filter((uc) => uc.id !== value.id),
        value,
      ].sort((a, b) => a.invitedName.localeCompare(b.invitedName));
    },
    updateConnections(value: IConnectionRequest[]) {
      this.availableConnections = value;
    },
    updateRooms(value: IRoom[]) {
      this.availableRooms.value = value;
    },
    addRoom(value: IRoom) {
      this.availableRooms.value = [...this.availableRooms.value, value];
    },
    updateRoom(value: IRoom) {},
    deleteRoom(value: string) {},
    addNewMessage(value: IMessage, roomId: string) {},
    addNewMessages(value: string, roomId: string) {},
  },
  getters: {
    getActiveRoom: (state) =>
      state.availableRooms.find((r) => r.id === state.activeRoomId),
    getActiveRoomCreatorName: (state) => {
      if (state.activeRoomId) {
        return state.availableRooms.find((r) => r.id === state.activeRoomId)
          .creatorName;
      }
      return "";
    },
    getActiveRoomMembers: (state) => {
      if (!state.activeRoomId) {
        return [];
      }
      return state.availableRooms.find((r) => r.id === state.activeRoomId)
        .members;
    },
    getConnections: (state) => state.availableConnections,
    getApprovedConnections: (state) => {
      const result = state.availableConnections.filter(
        (uc) => !uc.blocked && uc.approved
      );
      return result;
    },
  },
});

// todo: do this in setup script

// const getConnectionsAllowedForActiveRoom = computed(() => {
//   if (!getActiveRoom.value) {
//     return [];
//   }
//   return availableConnections.value.filter(
//     (uc) =>
//       !uc.blocked &&
//       uc.approved &&
//       uc.displayName !== userStore.getUserName &&
//       !getActiveRoom.value.members.some(
//         (arm) => arm.userName === uc.displayName
//       )
//   );
// });
