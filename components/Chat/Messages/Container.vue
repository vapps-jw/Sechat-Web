<template>
  <v-sheet id="chatView" class="ma-0 pr-2 overflow-auto">
    <chat-messages-message
      v-for="m in chatStore.getActiveRoom.messages"
      :message="m"
    />
  </v-sheet>
  <div
    v-if="chatStore.getActiveRoom.messages.length > 10"
    class="d-flex justify-end align-center"
  ></div>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();

const scrollToBottom = () => {
  const chatSection = document.getElementById("chatView");

  if (chatSection) {
    setTimeout(() => {
      chatSection.scrollTop = chatSection.scrollHeight;
    }, 0);
  }
};

onUpdated(() => {
  scrollToBottom();
});

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.container-style {
  height: 42dvh;
}
</style>
