<template>
  <div>
    <v-btn to="/">Go to Home</v-btn>

    <v-btn @click="() => signalr.createRoom('new room')">Create Room</v-btn>

    <v-btn @click="() => chatApi.getRooms()">Pull Rooms</v-btn>

    <v-btn @click="() => signalr.closeConnection()">Close connection</v-btn>
  </div>
</template>

<script setup lang="ts">
const signalr = useSignalR();
const chatApi = useChatApi();
const chatStore = useChatStore();
</script>

<style scoped></style>
