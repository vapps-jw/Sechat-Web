import { ChatViews, ContactState } from "~~/utilities/globalEnums";

interface IChatStore {
  availableRooms: IRoom[];
  availableContacts: IContactRequest[];
  activeChatTab: string;
  activeRoomId: string;
  newMessage: string;
}

export const useSechatChatStore = defineStore({
  id: "sechat-chat-store",
  state: () => {
    return {
      availableRooms: <IRoom[]>[],
      availableContacts: <IContactRequest[]>[],
      activeChatTab: <string>ChatViews.Rooms,
      activeRoomId: <string>"",
      newMessage: <string>"",
      keyInputDialog: <boolean>false,
    };
  },
  actions: {
    clearNewMessage() {
      this.newMessage = "";
    },
    activateMessagesView() {
      this.activeChatTab = ChatViews.Messages;
    },
    activateRoomsView() {
      this.activeChatTab = ChatViews.Rooms;
    },
    activateContactsView() {
      this.activeChatTab = ChatViews.Contacts;
    },
    activateSettingsView() {
      this.activeChatTab = ChatViews.Settings;
    },
    addContact(value: IContactRequest) {
      this.availableContacts = [...this.availableContacts, value].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    },
    updateContactState(name: string, value: string) {
      const contact = <IContactRequest>(
        this.availableContacts.find((c) => c.displayName === name)
      );
      if (contact) {
        contact.contactState = value;
      }
    },
    updateContact(value: IContactRequest) {
      this.availableContacts = [
        ...this.availableContacts.filter((uc) => uc.id !== value.id),
        value,
      ].sort((a, b) => a.displayName.localeCompare(b.displayName));
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
    markRoomMessagesAsViewed(userName: string, roomId: string) {
      const room: IRoom = this.availableRooms.find(
        (r: IRoom) => r.id === roomId
      );

      room.messages.forEach((m) => {
        if (!m.messageViewers.find((mv) => mv.user === userName)) {
          m.messageViewers.push(<IMessageViewer>{ user: userName });
        }
      });
    },
    markRoomMessageAsViewed(
      userName: string,
      roomId: string,
      messageId: number
    ) {
      const room: IRoom = this.availableRooms.find(
        (r: IRoom) => r.id === roomId
      );

      const message = room.messages.find((m) => m.id === messageId);
      if (
        !message ||
        message.messageViewers.find((mv) => mv.user === userName)
      ) {
        return;
      }

      message.messageViewers.push(<IMessageViewer>{ user: userName });
    },
    markMessagesAsViewed(this: IChatStore) {
      if (!this.activeRoomId) {
        return;
      }
      const room: IRoom = this.availableRooms.find(
        (r: IRoom) => r.id === this.activeRoomId
      );
      room.messages.forEach((m) => (m.wasViewed = true));
    },
    loadContacts(value: IContactRequest[]) {
      this.availableContacts = value.sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    },
    deleteContact(value: IResourceId) {
      this.availableContacts = this.availableContacts.filter(
        (uc) => uc.id !== value.id
      );
    },
    loadRooms(value: IRoom[]) {
      this.availableRooms = value.sort((a, b) => a.name.localeCompare(b.name));
      if (this.activeRoomId) {
        this.activeRoom = this.availableRooms.find((r) => r.id === value);
      }
    },
    updateRooms(this: IChatStore, updates: IRoom[]) {
      const newRooms = updates.filter(
        (nr) => !this.availableRooms.some((ar) => ar.id === nr.id)
      );
      const presentRooms = updates.filter((nr) =>
        this.availableRooms.some((ar) => ar.id === nr.id)
      );

      newRooms.forEach((newRoom) => {
        this.availableRooms.push(newRoom);
      });

      this.availableRooms.forEach((r) => {
        const updatedRoom = presentRooms.find((ur) => ur.id == r.id);
        if (updatedRoom) {
          updatedRoom.messages.forEach((msg) => {
            r.messages.push(msg);
          });
          r.members = updatedRoom.members;
        }
      });

      this.availableRooms = this.availableRooms.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
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
    rejectRoomSelection() {
      this.activeRoomId = "";
      this.activeChatTab = ChatViews.Rooms;
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

      if (!updatedRoom.messages.some((m) => m.id === value.id)) {
        updatedRoom.messages.push(value);
        updatedRoom.lastActivity = value.created;

        updatedRoom.messages = updatedRoom.messages.sort(
          (a, b) => Number(a.created) - Number(b.created)
        );
      }
    },
    addNewMessages(value: string, roomId: string) {},
  },
  getters: {
    getOnlineUsers: (state) =>
      state.availableContacts.filter(
        (c) => c.contactState === ContactState.Online
      ),
    getActiveRoomId: (state) => state.activeRoomId,
    getActiveChatTab: (state) => state.activeChatTab,
    isSettingsViewActive: (state) => state.activeChatTab === ChatViews.Settings,
    isRoomsViewActive: (state) => state.activeChatTab === ChatViews.Rooms,
    isMessagesViewActive: (state) => state.activeChatTab === ChatViews.Messages,
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
    getContacts: (state) => state.availableContacts,
    getApprovedConnections: (state) => {
      const result = state.availableContacts.filter(
        (uc) => !uc.blocked && uc.approved
      );
      return result;
    },
  },
});
