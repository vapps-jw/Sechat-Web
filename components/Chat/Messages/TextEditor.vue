<template>
  <v-card-actions>
    <v-textarea
      variant="solo"
      clear-icon="mdi-close-circle"
      clearable
      counter
      no-resize
      rows="3"
      v-model="newMessage"
    ></v-textarea>
    <v-btn icon="mdi-send" color="warning" @click="pushMessage"></v-btn>
  </v-card-actions>
</template>

<script setup lang="ts">
const chatStore = useChatStore();
const signalR = useSignalR();

const newMessage = ref("");

const pushMessage = () => {
  if (newMessage.value) {
    signalR.sendMessage(newMessage.value, chatStore.activeRoomId.value);
    newMessage.value = "";
  }
};
</script>

<style scoped></style>
