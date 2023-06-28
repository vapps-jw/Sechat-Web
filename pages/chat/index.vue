<template>
  <ChatVideoCall v-if="webRTC.videoCallViewVisible" />
  <div v-else>
    <v-window v-model="chatStore.activeChatTab">
      <v-window-item value="messages"> <ChatMessages /> </v-window-item>
      <v-window-item value="rooms"> <ChatRooms /> </v-window-item>
      <v-window-item value="contacts"> <ChatContacts /> </v-window-item>
      <v-window-item value="settings"> <ChatSettings /> </v-window-item>
    </v-window>
    <ChatBottomNav v-if="!webRTC.videoCallViewVisible" />
  </div>
</template>

<script setup lang="ts">
import { scrollToBottom } from "~/utilities/documentFunctions";
import { ChatViews } from "~~/utilities/globalEnums";

definePageMeta({
  layout: "board",
  middleware: ["authenticated", "chat-middleware"],
});

const webRTC = useWebRTCStore();
const chatStore = useSechatChatStore();
const chatApi = useChatApi();
const e2e = useE2Encryption();
const app = useSechatApp();

const selectedNav = ref(ChatViews.Rooms);

const { activeChatTab } = storeToRefs(chatStore);

watch(activeChatTab, async (newVal, oldVal) => {
  console.log("--> Nav Update", newVal, oldVal);

  if (selectedNav.value !== newVal) {
    selectedNav.value = newVal;
  }

  if (!chatStore.activeRoomId) {
    return;
  }
  if (activeChatTab.value !== ChatViews.Messages) {
    return;
  }
  try {
    if (chatStore.getActiveRoom.encryptedByUser) {
      console.log("Active encrypted room");

      const e2eCheck = e2e.checkE2ECookie(chatStore.getActiveRoom.id);
      if (!e2eCheck) {
        console.log("Key missing");
        chatStore.rejectRoomSelection();
        app.showErrorSnackbar("Room Key is missing, add it first");
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
          if (e2e.checkE2ECookie(r.id)) {
            r.hasKey = true;
            return;
          }
          r.hasKey = false;
        }
      });

      chatStore.updateRooms(data);
    }

    const markMessagesAsVided =
      chatStore.getActiveRoom.messages.filter((m) => !m.wasViewed).length > 0;

    if (markMessagesAsVided) {
      console.log("--> Nav Update -> Marking messages as viewed");
      chatApi.markMessagesAsViewed(chatStore.activeRoomId);
      chatStore.markMessagesAsViewed();
    }
  } catch (error) {
    app.showErrorSnackbar("Room update failed");
    console.error(error);
  }
  if (newVal === ChatViews.Messages) {
    scrollToBottom("chatView");
  }
});
</script>

<style scoped></style>
