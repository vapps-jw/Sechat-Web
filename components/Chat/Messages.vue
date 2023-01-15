<template>
  <div v-if="!chatStore.activeRoom.value">Select a Room</div>
  <v-container v-else>
    <v-card>
      <v-toolbar>
        <v-toolbar-title
          >Room: {{ chatStore.activeRoom.value.name }}</v-toolbar-title
        >
      </v-toolbar>
      <v-card-text ref="chatView">
        <v-list ref="chat" id="logs" v-if="chatStore.activeRoom.value">
          <v-list-item
            class="my-2"
            v-for="message in chatStore.activeRoom.value.messages"
            :title="message.text"
            :subtitle="`${message.nameSentBy} on ${new Date(
              message.created
            ).toLocaleString(appStore.localLanguage.value)}`"
            :key="message.id"
          >
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-text-field v-model="msg" label="Message"></v-text-field>
        <v-btn icon="mdi-cached" color="info" @click="pushMessage"></v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useChatStore();
const chatView = ref<HTMLInputElement | null>(null);
const signalR = useSignalR();
const appStore = useAppStore();

const msg = ref("");

const pushMessage = () => {
  signalR.sendMessage(msg.value);
  msg.value = "";

  if (chatView.value) {
    console.log("--> Scrolling", chatView);
    chatView.value.scrollTop = chatView.value.scrollHeight;
  }
};
</script>

<style scoped></style>
