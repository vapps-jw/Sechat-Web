import {
  BottomNavBarSet,
  ChatViews,
  ContactState,
} from "~~/utilities/globalEnums";

export const useSechatChatStore = defineStore({
  id: "sechat-chat-store",
  state: () => {
    return {
      availableRooms: <IRoom[]>[],
      callLogs: <ICallLog[]>[],
      availableContacts: <IContactRequest[]>[],
      activeRoomId: <string>null,
      activeContactId: <number>null,
      newMessage: <string>null,
      keyInputDialog: <boolean>false,
      activeBottomNav: <string>BottomNavBarSet.ChatNavBar,
      activeChatTab: <string>ChatViews.Messages,
    };
  },
  actions: {
    addNewCallLog(callLog: ICallLog) {
      this.callLogs.push(callLog);
      if (this.callLogs.length == 1) {
        return;
      }
    },
    updateCallLog(callLog: ICallLog) {
      this.callLogs = [
        ...this.callLogs.filter((cl) => cl.id !== callLog.id, callLog),
      ].sort((a, b) => Number(b.id) - Number(a.id));
    },
    loadCallLogs(newCallLogs: ICallLog[]) {
      this.callLogs = newCallLogs.sort((a, b) => Number(b.id) - Number(a.id));
    },
    activateNavBar(navName: string) {
      this.activeBottomNav = navName;
    },
    activateView(viewName: string) {
      this.activeChatTab = viewName;
    },
    clearNewMessage() {
      this.newMessage = "";
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

    // Handle Room Messages Views

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
    markActiveRoomMessagesAsViewed() {
      if (!this.activeRoomId) {
        return;
      }
      const room: IRoom = this.availableRooms.find(
        (r: IRoom) => r.id === this.activeRoomId
      );
      room.messages.forEach((m) => (m.wasViewed = true));
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

    // Handle Direct Message Views

    markDirectMessagesAsViewed(contactId: number) {
      const contact: IContactRequest = this.availableContacts.find(
        (c: IContactRequest) => c.id === contactId
      );
      if (!contact) {
        return;
      }
      contact.directMessages.forEach((m) => (m.wasViewed = true));
    },
    markDirectMessageAsViewed(contactId: number, messageId: number) {
      const contact: IContactRequest = this.availableContacts.find(
        (uc: IContactRequest) => uc.id === contactId
      );

      const message = contact.directMessages.find((m) => m.id === messageId);
      if (!message || message.wasViewed) {
        return;
      }

      message.wasViewed = true;
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
    updateRooms(updates: IRoom[]) {
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
      const rooms = this.availableRooms.filter((r) => r.id !== value.id);
      this.availableRooms = [...rooms, value].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    },
    deleteMessageFromRoom(value: IMessageDeleted) {
      if (!this.availableRooms.some((r) => r.id === value.roomId)) {
        return;
      }
      this.availableRooms.find((r) => r.id === value.roomId).messages =
        this.availableRooms
          .find((r) => r.id === value.roomId)
          .messages.filter((m) => m.id !== value.id);
    },
    deleteMessageFromContact(value: IDirectMessageId) {
      if (!this.availableContacts.some((c) => c.id === value.contactId)) {
        return;
      }
      this.availableContacts.find(
        (c) => c.id === value.contactId
      ).directMessages = this.availableContacts
        .find((c) => c.id === value.contactId)
        .directMessages.filter((m) => m.id !== value.id);
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
    replaceRoom(value: IRoom) {
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
      this.activeContactId = null;
      this.activeRoomId = value;
      this.activeChatTab = ChatViews.Messages;
    },
    rejectRoomSelection() {
      this.activeRoomId = null;
      this.activeChatTab = ChatViews.Rooms;
    },
    selectContact(value: number) {
      this.activeRoomId = null;
      this.activeContactId = value;
      this.activeChatTab = ChatViews.Messages;
    },
    rejectContactSelection() {
      this.activeContactId = null;
      this.activeChatTab = ChatViews.Contacts;
    },
    resetSelections() {
      this.activeContactId = null;
      this.activeRoomId = null;
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

      if (!updatedRoom.messages.some((m) => m.id === value.id)) {
        updatedRoom.messages.push(value);
        updatedRoom.lastActivity = value.created;

        updatedRoom.messages = updatedRoom.messages.sort(
          (a, b) => Number(a.created) - Number(b.created)
        );
      }
    },
    addNewDirectMessage(value: IDirectMessage) {
      const updatedContact = this.availableContacts.find(
        (c) => c.id === value.contactId
      );
      if (!updatedContact.directMessages.some((m) => m.id === value.id)) {
        updatedContact.directMessages.push(value);

        updatedContact.directMessages = updatedContact.directMessages.sort(
          (a, b) => Number(a.created) - Number(b.created)
        );
      }
    },
  },
  getters: {
    getNavColor: (state): string => {
      if (state.activeChatTab === ChatViews.AppsSelection) {
        return "warning";
      }
      return "grey-lighten-1";
    },
    getOnlineUsers: (state): IContactRequest[] =>
      state.availableContacts.filter(
        (c) => c.contactState === ContactState.Online
      ) as IContactRequest[],
    getActiveRoomId: (state) => state.activeRoomId,
    getActiveContactId: (state) => state.activeContactId,
    getActiveChatTab: (state) => state.activeChatTab,
    isSettingsViewActive: (state) => state.activeChatTab === ChatViews.Settings,
    isRoomsViewActive: (state) => state.activeChatTab === ChatViews.Rooms,
    isMessagesViewActive: (state) => state.activeChatTab === ChatViews.Messages,
    getActiveRoom: (state) =>
      state.availableRooms.find((r) => r.id === state.activeRoomId),
    getActiveContact: (state) =>
      state.availableContacts.find((r) => r.id === state.activeContactId),
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
    getContacts: (state): IContactRequest[] => state.availableContacts,
    getApprovedContacts: (state) => {
      const result = state.availableContacts.filter(
        (uc) => !uc.blocked && uc.approved
      );
      return result;
    },
  },
});
