<template>
  <v-bottom-navigation
    mode="shift"
    color="primary"
    v-model="chatStore.activeChatTab"
  >
    <v-btn :value="ChatViews.Messages" @click="chatStore.activateMessagesView">
      <v-icon>mdi-chat-processing</v-icon>
      <span>Messages</span>
    </v-btn>
    <v-btn :value="ChatViews.Rooms" @click="chatStore.activateRoomsView">
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
    <v-btn :value="ChatViews.Contacts" @click="chatStore.activateContactsView">
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

    <v-btn :value="ChatViews.Settings" @click="chatStore.activateSettingsView">
      <ChatStatusConnectionIcon />
      <span>Settings</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { ChatViews } from "~~/utilities/globalEnums";
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
  console.log("Computed changed");
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
  return (
    availableRooms.value.filter((c) =>
      c.messages.some(
        (cm) => !cm.wasViewed && userStore.getUserName !== cm.nameSentBy
      )
    ).length > 0
  );
});

const pendingRoomMessagesCount = computed<number>(() => {
  const count = availableRooms.value
    .filter((c) =>
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
