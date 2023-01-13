<template>
  <div>
    <p>chat</p>
    <v-btn to="/">Go to Home</v-btn>

    <v-btn @click="test">Open connection</v-btn>

    <v-divider class="ma-5"></v-divider>

    <v-btn @click="() => signalr.createRoom('new room')">Create Room</v-btn>

    <v-btn @click="() => chatApi.getRooms()">Pull Rooms</v-btn>

    <v-divider class="ma-5"></v-divider>
    <div class="d-flex justify-center">
      <v-card width="300px">
        <v-card-title class="text-xs-h6">Rooms</v-card-title>
        <v-card-text>
          <v-list lines="one">
            <v-list-item
              v-for="item in chatStore.rooms.value"
              :key="item.id"
              :title="item.name"
              subtitle="..."
            ></v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const signalr = useSignalR();
const chatApi = useChatApi();
const chatStore = useChatStore();

onMounted(() => {
  console.log("--> Chat mounted");
  signalr.openConnection();
  //chatApi.getRooms();
});

const test = () => {
  signalr.openConnection();
};
</script>

<style scoped></style>
