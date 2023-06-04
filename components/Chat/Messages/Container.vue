<template>
  <v-sheet id="chatView" class="ma-0 pr-2 overflow-auto">
    <chat-messages-message
      v-for="m in chatStore.activeRoom.messages"
      :message="m"
    />
  </v-sheet>

  <!-- <v-virtual-scroll
      ref="messagesVirtualScrollRef"
      :items="chatStore.activeRoom.messages"
    >
      <template v-slot:default="{ item }">
        <chat-messages-message :message="item" />
      </template>
    </v-virtual-scroll> -->

  <div class="d-flex justify-end align-center">
    <v-btn
      icon="mdi-arrow-down-drop-circle"
      size="small"
      color="accent"
      @click="scrollToBottom"
    ></v-btn>
  </div>
</template>

<script setup lang="ts">
import { ChatViews } from "~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const userStore = useUserStore();

//const messagesVirtualScrollRef = ref();
// const scroll = () => {
//   console.log(
//     "--> Scrolling",
//     messagesVirtualScrollRef.value,
//     chatStore.activeRoom.messages.length
//   );
//   messagesVirtualScrollRef.value?.scrollToIndex(
//     chatStore.activeRoom.messages.length
//   );
// };

const scrollToBottom = () => {
  const chatSection = document.getElementById("chatView");

  if (chatSection) {
    setTimeout(() => {
      chatSection.scrollTop = chatSection.scrollHeight;
    }, 0);
  }
};

const { activeChatTab, getActiveRoomMessagesCount } = storeToRefs(chatStore);
watch(activeChatTab, (newVal, oldVal) => {
  if (newVal === ChatViews.Messages) {
    console.warn("--> Watcher scroll", newVal, oldVal);
    scrollToBottom();
  }
});
watch(getActiveRoomMessagesCount, (newVal, oldVal) => {
  scrollToBottom();
});

// onUpdated(() => {
//   console.warn("--> onUpdated Scrolling", messagesVirtualScrollRef.value);
//   if (messagesVirtualScrollRef.value) {
//     scroll();
//   }
// });

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.tiny-font {
  font-size: x-small;
}
.sender-details {
  color: #ffc107;
  font-weight: bold;
}
.container-style {
  height: 42dvh;
}
</style>
