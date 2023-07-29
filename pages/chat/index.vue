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
      if (chatStore.getActiveRoom.encryptedByUser) {
        console.log("Active encrypted room");

        const e2eCheck = e2e.checkCookie(
          chatStore.getActiveRoomId,
          CustomCookies.E2E
        );
        if (!e2eCheck) {
          console.log("Key missing");
          chatStore.rejectRoomSelection();
          sechatStore.showErrorSnackbar("Key is missing, add it first");
          return;
        }

        const updateRequest = <IRoomUpdateRequest>{
          roomId: chatStore.getActiveRoom.id,
          lastMessage:
            chatStore.getActiveRoom.messages.length == 0
              ? 0
              : chatStore.getActiveRoom.messages.at(-1).id,
        };
        const data = await chatApi.getRoomsUpdate([updateRequest]);
        data.forEach((r) => {
          if (r.encryptedByUser) {
            if (e2e.checkCookie(r.id, CustomCookies.E2E)) {
              r.hasKey = true;
              return;
            }
            r.hasKey = false;
          }
        });

        chatStore.updateRooms(data);
      }

      console.log("Nav Update standard actions");

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
      if (chatStore.getActiveContact.encryptedByUser) {
        console.log("Active encrypted contact");

        const e2eCheck = e2e.checkCookie(
          chatStore.getActiveContactId,
          CustomCookies.E2EDM
        );
        if (!e2eCheck) {
          // TODO: remove this if unnecessary
          // console.log("Key missing");
          // chatStore.rejectContactSelection();
          // app.showErrorSnackbar("Key is missing, add it first");
          return;
        }
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
