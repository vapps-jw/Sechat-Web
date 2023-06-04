<template>
  <div id="chatView" style="display: flex; height: 51dvh">
    <v-virtual-scroll
      ref="messagesVirtualScrollRef"
      :items="chatStore.activeRoom.messages"
    >
      <template v-slot:default="{ item }">
        <chat-messages-message :message="item" />
      </template>
    </v-virtual-scroll>
  </div>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
const userStore = useUserStore();
const appStore = useSechatAppStore();

let messagesVirtualScrollRef = ref();

const scrollToBottom = (elementId: string) => {
  const chatSection = document.getElementById(elementId);

  if (chatSection) {
    console.log("--> Scrolling chat section");
    chatSection.scrollTop = chatSection.scrollHeight;
  }
};

const scroll = () => {
  console.log("--> Scrolling", activeRoom.value.messages.length);
  //scrollToBottom("chatView");
  messagesVirtualScrollRef.value?.scrollToIndex(0);
  messagesVirtualScrollRef.value?.scrollToIndex(
    activeRoom.value.messages.length
  );
};

const { activeRoom } = storeToRefs(chatStore);

watch(activeRoom.value.messages, (newVal, oldVal) => {
  console.warn("--> Message list changed");
  scroll();
});

onUpdated(() => {
  messagesVirtualScrollRef = ref();
  if (messagesVirtualScrollRef.value) {
    console.warn("--> onUpdated Scrolling");
    scroll();
  }
});

onMounted(() => {
  messagesVirtualScrollRef = ref();
  console.warn("--> onMounted Scrolling");
  scroll();
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
</style>
