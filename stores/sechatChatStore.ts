import { insertTypingUser } from "~/utilities/arrayFunctions";
import {
  BottomNavBarSet,
  ChatViews,
  ContactState,
  ImageTypes,
} from "~~/utilities/globalEnums";

export const useSechatChatStore = defineStore({
  id: "sechat-chat-store",
  state: () => {
    return {
      lazyLoadInProgress: <boolean>false,
      suggestedContacts: <SuggestedContact[]>[],
      availableRooms: <IRoom[]>[],
      callLogs: <ICallLog[]>[],
      availableContacts: <IContactRequest[]>[],
      activeRoomId: <string>null,
      activeContactId: <number>null,
      newMessage: <string>null,
      schareApiTriggered: <boolean>false,
      schareApiData: <ShareApiData>null,
      typingUsers: <string[]>[],
      activeBottomNav: <string>BottomNavBarSet.ChatNavBar,
      activeChatTab: <string>ChatViews.Messages,
      profilePictures: new Map<string, string>(),
    };
  },
  actions: {
    clearShareApiData() {
      this.schareApiTriggered = false;
      this.schareApiData = null;
    },
    setShareApiData(title: string, text: string) {
      this.schareApiTriggered = true;
      this.schareApiData = {
        title: title,
        text: text,
      } as ShareApiData;
    },
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
    addMoreMessagesToRoom(roomId: string, messages: IMessage[]) {
      if (!this.activeRoomId || this.activeRoomId !== roomId) {
        return;
      }

      const room: IRoom = this.availableRooms.find(
        (r: IRoom) => r.id === roomId
      );
      room.messages.unshift(...messages);
    },
    addMoreMessagesToContact(contactId: number, messages: IDirectMessage[]) {
      if (!this.activeContactId || this.activeContactId !== contactId) {
        return;
      }
      const room: IContactRequest = this.availableContacts.find(
        (c: IContactRequest) => c.id === contactId
      );
      room.directMessages.unshift(...messages);
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

    // Contacts

    loadContacts(value: IContactRequest[]) {
      this.availableContacts = value.sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
      const pp = this.profilePictures as Map<string, string>;
      pp.clear();
      this.availableContacts.forEach((contact) => {
        pp.set(contact.displayName, contact.profileImage);
      });
    },
    addContact(value: IContactRequest) {
      this.availableContacts = [...this.availableContacts, value].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
      const pp = this.profilePictures as Map<string, string>;
      pp.set(value.displayName, value.profileImage);
    },
    deleteContact(value: IResourceId) {
      const toBeDeleted = this.availableContacts.find((c) => c.id === value.id);
      if (!toBeDeleted) {
        return;
      }
      this.availableContacts = this.availableContacts.filter(
        (uc) => uc.id !== value.id
      );
      const pp = this.profilePictures as Map<string, string>;
      pp.delete(toBeDeleted.displayName);
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

      const pp = this.profilePictures as Map<string, string>;
      pp.delete(value.displayName);
      pp.set(value.displayName, value.profileImage);
    },
    updateContactMessage(value: IDirectMessage) {
      const contact = this.availableContacts.find(
        (c) => c.id === value.contactId
      );
      if (!contact) {
        return;
      }
      const updatedMessage = contact.directMessages.find(
        (message) => message.id === value.id
      );
      updatedMessage.loaded = value.loaded;
      updatedMessage.decrypted = value.decrypted;
      updatedMessage.text = value.text;
    },
    updateContacts(updates: IContactRequest[]) {
      this.availableContacts = this.availableContacts.filter((ac) =>
        updates.some((nc) => nc.id === ac.id)
      );

      const pp = this.profilePictures as Map<string, string>;
      updates.forEach((uc) => {
        pp.delete(uc.displayName);
        pp.set(uc.displayName, uc.profileImage);
      });

      const newContacts = updates.filter(
        (nc) => !this.availableContacts.some((ac) => ac.id === nc.id)
      );

      newContacts.forEach((nc) => {
        this.availableContacts.push(nc);
      });

      this.availableContacts.forEach((ac) => {
        const updatedContact = updates.find((pc) => pc.id == ac.id);
        if (updatedContact) {
          ac.approved = updatedContact.approved;
          ac.blocked = updatedContact.blocked;
          ac.blockedByName = updatedContact.blockedByName;
          ac.contactState = updatedContact.contactState;
          ac.verified = updatedContact.verified;
          updatedContact.directMessages.forEach((msg) => {
            ac.directMessages.push(msg);
          });
        }
      });
    },

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

    updateRoomMessage(value: IMessage) {
      const room = this.availableRooms.find((c) => c.id === value.roomId);
      if (!room) {
        return;
      }
      const updatedMessage = room.messages.find(
        (message) => message.id === value.id
      );
      updatedMessage.loaded = value.loaded;
      updatedMessage.decrypted = value.decrypted;
      updatedMessage.text = value.text;
    },
    loadRooms(value: IRoom[]) {
      this.availableRooms = value.sort((a, b) => a.name.localeCompare(b.name));
    },
    updateRooms(updates: IRoom[]) {
      this.availableRooms = this.availableRooms.filter((ar) =>
        updates.some((nr) => nr.id === ar.id)
      );

      const newRooms = updates.filter(
        (nr) => !this.availableRooms.some((ar) => ar.id === nr.id)
      );

      newRooms.forEach((newRoom) => {
        this.availableRooms.push(newRoom);
      });

      this.availableRooms.forEach((room) => {
        const updatedRoom = updates.find((ur) => ur.id == room.id);
        if (updatedRoom) {
          updatedRoom.messages.forEach((msg) => {
            room.messages.push(msg);
          });
          room.members = updatedRoom.members;
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
    addTypingUser(value: string) {
      insertTypingUser(this.typingUsers, value);
    },
    removeTypingUser(value: string) {
      this.typingUsers = this.typingUsers.filter((e) => e !== value);
    },
    selectRoom(value: string) {
      this.activeContactId = null;
      this.activeRoomId = value;
      this.activeChatTab = ChatViews.Messages;
      this.typingUsers = [];
    },
    rejectRoomSelection() {
      this.activeRoomId = null;
      this.activeChatTab = ChatViews.Rooms;
    },
    selectContact(value: number) {
      this.activeRoomId = null;
      this.activeContactId = value;
      this.activeChatTab = ChatViews.Messages;
      this.typingUsers = [];
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
    addNewRoomMessage(value: IMessage) {
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
    addNewRoomMessages(value: IMessage[]) {
      const room = this.availableRooms.find(
        (c) => c.id === value[0].roomId
      ) as IRoom;
      const toBeAdded = value.filter(
        (m) => !room.messages.some((nm) => nm.id === m.id)
      );
      if (toBeAdded.length === 0) {
        return;
      }

      room.messages = [...room.messages, ...toBeAdded];
      room.messages = room.messages.sort(
        (a, b) => Number(a.created) - Number(b.created)
      );
    },
    addNewDirectMessage(value: IDirectMessage) {
      const contact = this.availableContacts.find(
        (c) => c.id === value.contactId
      );
      if (!contact.directMessages.some((m) => m.id === value.id)) {
        contact.directMessages.push(value);

        contact.directMessages = contact.directMessages.sort(
          (a, b) => Number(a.created) - Number(b.created)
        );
      }
    },
    addNewDirectMessages(value: IDirectMessage[]) {
      const contact = this.availableContacts.find(
        (c) => c.id === value[0].contactId
      ) as IContactRequest;
      const toBeAdded = value.filter(
        (m) => !contact.directMessages.some((nm) => nm.id === m.id)
      );
      if (toBeAdded.length === 0) {
        return;
      }

      contact.directMessages = [...contact.directMessages, ...toBeAdded];
      contact.directMessages = contact.directMessages.sort(
        (a, b) => Number(a.created) - Number(b.created)
      );
    },
  },
  getters: {
    lastMessageInRooms: (state): number => {
      const allMessages = <IMessage[]>[];
      if (state.availableRooms.length == 0) {
        return 0;
      }
      state.availableRooms.forEach((ar) => {
        allMessages.push(...ar.messages);
      });
      if (allMessages.length == 0) {
        return 0;
      }
      return Math.max(...allMessages.map((m) => m.id));
    },
    lastMessageInContacts: (state): number => {
      const allMessages = <IMessage[]>[];
      if (state.availableContacts.length == 0) {
        return 0;
      }
      state.availableContacts.forEach((ac) => {
        allMessages.push(...ac.directMessages);
      });
      if (allMessages.length == 0) {
        return 0;
      }
      return Math.max(...allMessages.map((m) => m.id));
    },
    messageContainsGraphic: (state) =>
      state.newMessage?.includes(ImageTypes.ChatImage) ||
      state.newMessage?.includes(ImageTypes.ChatViedo),
    getNavColor: (state): string => {
      if (state.activeChatTab === ChatViews.AppsSelection) {
        return "warning";
      }
      return "grey-lighten-1";
    },
    canLoadMore: (state): boolean => {
      if (state.activeContactId) {
        if (
          state.availableContacts.find((r) => r.id === state.activeContactId)
            .directMessages.length >= 10
        ) {
          return true;
        }
      }
      if (state.activeRoomId) {
        if (
          state.availableRooms.find((r) => r.id === state.activeRoomId).messages
            .length >= 10
        ) {
          return true;
        }

        return false;
      }
    },
    getOnlineUsers: (state): IContactRequest[] =>
      state.availableContacts.filter(
        (c) => c.contactState === ContactState.Online
      ) as IContactRequest[],
    getActiveRoomId: (state) => state.activeRoomId,
    getContact: (state) => (name: string) =>
      state.availableContacts.find((c) => c.displayName === name)?.profileImage,
    getActiveContactId: (state) => state.activeContactId,
    getActiveChatTab: (state) => state.activeChatTab,
    isSettingsViewActive: (state) => state.activeChatTab === ChatViews.Settings,
    isRoomsViewActive: (state) => state.activeChatTab === ChatViews.Rooms,
    isMessagesViewActive: (state) => state.activeChatTab === ChatViews.Messages,
    getActiveRoom: (state): IRoom =>
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
    getApprovedContactsWithKeys: (state) => {
      const result = state.availableContacts.filter(
        (uc) => !uc.blocked && uc.approved && uc.hasKey
      );
      return result;
    },
    getAvailableRoomsWithKeys: (state) => {
      const result = state.availableRooms.filter((room) => room.hasKey);
      return result;
    },
  },
});
