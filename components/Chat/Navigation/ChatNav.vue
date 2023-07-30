<template>
  <v-bottom-navigation
    mode="shift"
    color="primary"
    v-model="chatStore.activeChatTab"
  >
    <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.ChatNavBar"
      :value="ChatViews.Messages"
      @click="chatStore.activateView(ChatViews.Messages)"
    >
      <v-icon>mdi-chat-processing</v-icon>
      <span>Messages</span>
    </v-btn>
    <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.ChatNavBar"
      :value="ChatViews.Rooms"
      @click="chatStore.activateView(ChatViews.Rooms)"
    >
      <v-badge
        :model-value="pendingRoomMessagesPresent"
        :content="pendingRoomMessagesCount"
        color="error"
        size="small"
      >
        <v-icon>mdi-forum</v-icon>
      </v-badge>

      <span>Rooms</span>
    </v-btn>
    <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.ChatNavBar"
      :value="ChatViews.Contacts"
      @click="chatStore.activateView(ChatViews.Contacts)"
    >
      <v-badge
        :model-value="pendingContactMessagesPresent"
        :content="pendingContactMessagesCount"
        color="error"
        size="small"
      >
        <v-icon>mdi-account-group</v-icon>
      </v-badge>

      <span>Contacts</span>
    </v-btn>

    <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.CalendarNavBar"
      :value="ChatViews.Events"
      @click="chatStore.activateView(ChatViews.WorkInProgress)"
    >
      <v-icon>mdi-calendar-star</v-icon>
      <span>Events</span>
    </v-btn>
    <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.CalendarNavBar"
      :value="ChatViews.Calendar"
      @click="chatStore.activateView(ChatViews.WorkInProgress)"
    >
      <v-icon>mdi-calendar-month</v-icon>
      <span>Calendar</span>
    </v-btn>
    <!-- <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.CalendarNavBar"
      :value="ChatViews.Notes"
      @click="chatStore.activateView(ChatViews.Notes)"
    >
      <v-icon>mdi-notebook-edit-outline</v-icon>
      <span>Notes</span>
    </v-btn> -->

    <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.ProfileNavBar"
      :value="ChatViews.Exit"
      @click="chatStore.activateView(ChatViews.Exit)"
    >
      <v-icon>mdi-exit-to-app</v-icon>
      <span>Exit</span>
    </v-btn>
    <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.ProfileNavBar"
      :value="ChatViews.Security"
      @click="chatStore.activateView(ChatViews.Security)"
    >
      <v-icon>mdi-shield-lock</v-icon>
      <span>Security</span>
    </v-btn>
    <v-btn
      color="tertiary"
      v-if="chatStore.activeBottomNav === BottomNavBarSet.ProfileNavBar"
      :value="ChatViews.Settings"
      @click="chatStore.activateView(ChatViews.Settings)"
    >
      <ChatStatusConnectionIcon />
      <span>Settings</span>
    </v-btn>

    <v-btn
      color="warning"
      :value="ChatViews.AppsSelection"
      @click="chatStore.activateView(ChatViews.AppsSelection)"
    >
      <v-icon>mdi-apps</v-icon>
      <span>Sechat</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { ChatViews, BottomNavBarSet } from "~~/utilities/globalEnums";
const chatStore = useSechatChatStore();
const userStore = useUserStore();

const { availableContacts, availableRooms } = storeToRefs(chatStore);

const pendingContactMessagesPresent = computed<boolean>(() => {
  return (
    availableContacts.value.filter((c) =>
      c.directMessages.some(
        (cm) => !cm.wasViewed && userStore.getUserName !== cm.nameSentBy
      )
    ).length > 0
  );
});

const pendingContactMessagesCount = computed<number>(() => {
  const count = availableContacts.value
    .filter((c) =>
      c.directMessages.some(
        (cm) => !cm.wasViewed && userStore.getUserName !== cm.nameSentBy
      )
    )
    .reduce(
      (acc, cv) =>
        acc +
        cv.directMessages.filter(
          (cm) => !cm.wasViewed && userStore.getUserName !== cm.nameSentBy
        ).length,
      0
    );

  return count;
});

const pendingRoomMessagesPresent = computed<boolean>(() => {
  console.log("Checking for unseen messages");
  return (
    availableRooms.value.filter((c: IRoom) =>
      c.messages.some(
        (cm) => !cm.wasViewed && userStore.getUserName !== cm.nameSentBy
      )
    ).length > 0
  );
});

const pendingRoomMessagesCount = computed<number>(() => {
  console.log("Counting for unseen messages");
  const count = availableRooms.value
    .filter((c: IRoom) =>
      c.messages.some(
        (cm) => !cm.wasViewed && userStore.getUserName !== cm.nameSentBy
      )
    )
    .reduce(
      (acc, cv) =>
        acc +
        cv.messages.filter(
          (cm) => !cm.wasViewed && userStore.getUserName !== cm.nameSentBy
        ).length,
      0
    );

  return count;
});
</script>

<style scoped></style>
