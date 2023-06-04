<template>
  <div id="chatView" class="d-flex container-style flex-grow-1">
    <v-virtual-scroll
      ref="messagesVirtualScrollRef"
      :items="chatStore.activeRoom.messages"
    >
      <template v-slot:default="{ item }">
        <chat-messages-message :message="item" />
      </template>
    </v-virtual-scroll>
  </div>
  <div class="d-flex justify-end align-center">
    <v-btn
      icon="mdi-arrow-down-drop-circle"
      size="small"
      color="accent"
      @click="scroll"
    ></v-btn>
  </div>
</template>

<script setup lang="ts">
import { ChatViews } from "~/utilities/globalEnums";

const chatStore = useSechatChatStore();
const userStore = useUserStore();

const messagesVirtualScrollRef = ref();
const scroll = () => {
  console.log(
    "--> Scrolling",
    messagesVirtualScrollRef.value,
    chatStore.activeRoom.messages.length
  );
  messagesVirtualScrollRef.value?.scrollToIndex(
    chatStore.activeRoom.messages.length
  );
};

const { activeChatTab, getActiveRoomMessagesCount } = storeToRefs(chatStore);
watch(activeChatTab, (newVal, oldVal) => {
  if (newVal === ChatViews.Messages) {
    console.warn("--> Watcher scroll", newVal, oldVal);
    scroll();
  }
});
watch(getActiveRoomMessagesCount, (newVal, oldVal) => {
  scroll();
});

// onUpdated(() => {
//   console.warn("--> onUpdated Scrolling", messagesVirtualScrollRef.value);
//   if (messagesVirtualScrollRef.value) {
//     scroll();
//   }
// });

onMounted(() => {
  console.warn("--> onMounted Scrolling", messagesVirtualScrollRef.value);
  scroll();
});

onBeforeUnmount(() => {
  console.info("--> onBeforeUnmount Messages Container");
});

const isActiveUser = (message: IMessage) => {
  return message.nameSentBy === userStore.getUserName;
};
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
