<template>
  <div>
    <v-window v-model="chatStore.activeChatTab">
      <v-window-item value="messages"> <ChatMessages /> </v-window-item>
      <v-window-item value="rooms"> <ChatRooms /> </v-window-item>
      <v-window-item value="settings"> <ChatProfile /> </v-window-item>
    </v-window>
    <v-bottom-navigation
      mode="shift"
      color="primary"
      v-model="selectedNav"
      :on-update:model-value="navUpdated"
    >
      <v-btn plain value="messages" @click="chatStore.activateMessagesView">
        <v-icon>mdi-chat-processing</v-icon>
        <span>Messages</span>
      </v-btn>
      <v-btn plain value="rooms" @click="chatStore.activateRoomsView">
        <v-icon>mdi-forum</v-icon>
        <span>Rooms</span>
      </v-btn>
      <v-btn plain value="settings" @click="chatStore.activateSettingsView">
        <v-icon>mdi-account-details</v-icon>
        <span>Settings</span>
      </v-btn>
      <div class="d-flex align-center flex-end">
        <ChatStatusConnectionIcon />
      </div>
    </v-bottom-navigation>
  </div>
</template>

<script setup lang="ts">
import { scrollToBottom } from "~~/utilities/documentFunctions";
import { ChatViews } from "~~/utilities/globalEnums";

definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const chatStore = useSechatChatStore();
const chatApi = useChatApi();
const chatApp = useSechatApp();

const selectedNav = ref(ChatViews.Rooms);

const navUpdated = (model) => {
  console.log("--> Model", model);
};

const { activeChatTab } = storeToRefs(chatStore);

watch(activeChatTab, (newVal, oldVal) => {
  console.log("--> Nav Update", newVal, oldVal);

  if (selectedNav.value !== newVal) {
    selectedNav.value = newVal;
  }

  if (newVal === ChatViews.Messages) {
    scrollToBottom("chatView");
  }

  if (!chatStore.activeRoomId) {
    return;
  }
  if (activeChatTab.value !== ChatViews.Messages) {
    return;
  }
  try {
    chatApp.showLoadingOverlay();
    chatApi.markMessagesAsViewed(chatStore.activeRoomId);
    chatStore.markMessagesAsViewed();
  } catch (error) {
  } finally {
    chatApp.hideLoadingOverlay();
  }
});
</script>

<style scoped></style>
