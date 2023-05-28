<template>
  <v-sheet id="chatView" class="ma-0 pa-0 overflow-auto">
    <!-- <div
      class="d-flex"
      :class="
        isActiveUser(message)
          ? 'flex-row-reverse ma-1 '
          : 'flex-row flex-start ma-1 '
      "
      v-for="message in chatStore.getActiveRoom.messages"
    >
      <chat-messages-message :message="message" />
    </div> -->

    <v-virtual-scroll
      ref="messagesVirtualScrollRef"
      scrollToBottom="true"
      :items="chatStore.getActiveRoom.messages"
    >
      <template v-slot:default="{ item }">
        <div
          class="d-flex"
          :class="
            isActiveUser(item)
              ? 'flex-row-reverse ma-1 '
              : 'flex-row flex-start ma-1 '
          "
        >
          <chat-messages-message :message="item" />
        </div>
      </template>
    </v-virtual-scroll>
  </v-sheet>
</template>

<script setup lang="ts">
import { scrollToBottom } from "@/utilities/documentFunctions";

const chatStore = useSechatChatStore();
const userStore = useUserStore();

const messagesVirtualScrollRef = ref();

const scroll = () => {
  messagesVirtualScrollRef.value?.scrollToIndex(
    chatStore.getActiveRoom.messages.length
  );
};

onUpdated(() => {
  console.warn("--> onUpdated Scrolling");
  scrollToBottom("chatView");
});

onMounted(() => {
  console.warn("--> onMounted Scrolling");
  scrollToBottom("chatView");
});

const isActiveUser = (message: IMessage) => {
  return message.nameSentBy === userStore.getUserName;
};
</script>

<style scoped></style>
