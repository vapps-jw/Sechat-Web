<template>
  <div>
    <v-btn to="/">Go to Home</v-btn>
  </div>
</template>

<script setup lang="ts">
const signalr = useSignalR();
const chatApi = useChatApi();
const chatStore = useChatStore();
</script>

<style scoped></style>
