<template>
  <div>
    <ChatVideoCall v-if="webRTC.videoCallViewVisible" />
    <div v-else>
      <ChatNavigationViewControl />
      <ChatNavigationChatNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { scrollToBottom } from "~/utilities/documentFunctions";
import {
  ChatViews,
  CustomCookies,
  BottomNavBarSet,
} from "~~/utilities/globalEnums";

definePageMeta({
  layout: "board",
  middleware: ["authenticated", "chat-middleware"],
});

const webRTC = useWebRTCStore();
const chatStore = useSechatChatStore();
const chatApi = useChatApi();
const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();
const userStore = useUserStore();

const selectedNav = ref(ChatViews.Rooms);
const { activeChatTab } = storeToRefs(chatStore);

watch(activeChatTab, async (newVal, oldVal) => {
  console.log("Nav Update", newVal, oldVal);

  if (selectedNav.value !== newVal) {
    selectedNav.value = newVal;
  }

  if (activeChatTab.value !== ChatViews.Messages) {
    return;
  }

  // Handle messages viewed for Room
  if (chatStore.activeRoomId) {
    console.log("Nav Update For Room", chatStore.getActiveRoom);
    try {
      if (!chatStore.getActiveRoom.hasKey) {
        return;
      }

      const markMessagesAsVided =
        chatStore.getActiveRoom.messages.filter((m) => !m.wasViewed).length > 0;

      if (markMessagesAsVided) {
        console.log("Nav Update -> Marking messages as viewed");
        chatApi.markMessagesAsViewed(chatStore.activeRoomId);
        chatStore.markActiveRoomMessagesAsViewed();
      }

      console.log("Nav Update watcher done");
    } catch (error) {
      sechatStore.showErrorSnackbar("Room update failed");
      console.error(error);
    }
  }

  // Handle messages viewed for Direct Messages Chat
  if (chatStore.activeContactId) {
    try {
      if (!chatStore.getActiveContact.hasKey) {
        return;
      }

      const markMessagesAsVided =
        chatStore.getActiveContact.directMessages.filter(
          (m) =>
            !m.wasViewed && m.nameSentBy !== userStore.getUserName && !m.error
        ).length > 0;

      if (markMessagesAsVided) {
        console.log("Nav Update -> Marking messages as viewed");
        chatApi.markDirectMessagesAsViewed(chatStore.activeContactId);
        chatStore.markDirectMessagesAsViewed(chatStore.activeContactId);
      }
    } catch (error) {
      sechatStore.showErrorSnackbar("Chat update failed");
      console.error(error);
    }
  }

  if (newVal === ChatViews.Messages) {
    scrollToBottom("chatView");
  }
});
</script>

<style scoped></style>
