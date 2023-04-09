import { ChatViews } from "~~/utilities/globalEnums";

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
    activateMessagesTab() {
      this.activeChatTab = ChatViews.Messages;
    },
    activateRoomsTab() {
      this.activeChatTab = ChatViews.Rooms;
    },
    addConnection(value: IConnectionRequest) {
      this.availableConnections = [...this.availableConnections, value].sort(
        (a, b) => a.invitedName.localeCompare(b.invitedName)
      );
    },
    updateConnection(value: IConnectionRequest) {
      this.availableConnections = [
        ...this.availableConnections.filter((uc) => uc.id !== value.id),
        value,
      ].sort((a, b) => a.invitedName.localeCompare(b.invitedName));
    },
    markMessagesAsViewedByUser(userName: string) {
      this.availableRooms.forEach((r) =>
        r.messages.forEach((m) => {
          if (m.messageViewers.find((mv) => mv.user === userName)) {
            m.wasViewed = true;
          }
        })
      );
    },
    markMessagesAsViewed() {
      if (!this.activeRoomId) {
        return;
      }
      const room: IRoom = this.availableRooms.find(
        (r: IRoom) => r.id === this.activeRoomId
      );
      room.messages.forEach((m) => (m.wasViewed = true));
    },
    loadConnections(value: IConnectionRequest[]) {
      this.availableConnections = value;
    },
    deleteConnection(value: IResourceId) {
      this.availableConnections = this.availableConnections.filter(
        (uc) => uc.id !== value.id
      );
    },
    loadRooms(value: IRoom[]) {
      this.availableRooms = value.sort((a, b) => a.name.localeCompare(b.name));
    },
    addRoom(value: IRoom) {
      this.availableRooms = [...this.availableRooms, value].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    },
    updateRoom(value: IRoom) {
      value.messages = this.availableRooms.find(
        (r) => r.id === this.activeRoomId
      ).messages;

      this.availableRooms = [
        ...this.availableRooms.filter((uc) => uc.id !== value.id),
        value,
      ].sort((a, b) => a.name.localeCompare(b.name));
    },
    deleteRoom(value: string) {
      if (this.activeRoomId === value) {
        this.activeRoomId = "";
        this.activeChatTab = ChatViews.Rooms;
      }
      this.availableRooms = [
        ...this.availableRooms.filter((uc) => uc.id !== value),
      ];
    },
    addUserToRoom(value: IRoom) {
      const storedRoom = this.availableRooms.find((r) => r.id === value.id);
      if (!storedRoom) {
        this.availableRooms.push(value);
        return;
      }

      const updatedRoom = this.availableRooms.find((r) => r.id === value.id);
      updatedRoom.members = value.members;
    },
    selectRoom(value: string) {
      this.activeRoomId = value;
      this.activeChatTab = ChatViews.Messages;
    },
    deleteUserFromRoom(value: IUserRoomOptions) {
      const updatedRoom = this.availableRooms.find(
        (r) => r.id === value.roomId
      );

      updatedRoom.members = updatedRoom.members.filter(
        (m) => m.userName !== value.userName
      );
    },
    deleteCurrentUserFromRoom(value: IUserRoomOptions) {
      if (value.roomId === this.activeRoomId) {
        this.activeRoomId = "";
        this.activeChatTab = ChatViews.Rooms;
      }

      this.availableRooms = [
        ...this.availableRooms.filter((uc) => uc.id !== value.roomId),
      ];
    },
    addNewMessage(value: IMessage) {
      const updatedRoom = this.availableRooms.find(
        (r) => r.id === value.roomId
      );

      updatedRoom.messages.push(value);
      updatedRoom.lastActivity = value.created;

      updatedRoom.messages = updatedRoom.messages.sort(
        (a, b) => Number(a.created) - Number(b.created)
      );
    },
    addNewMessages(value: string, roomId: string) {},
  },
  getters: {
    getActiveRoomId: (state) => state.activeRoomId,
    getActiveChatTab: (state) => state.activeChatTab,
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
