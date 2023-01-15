<template>
  <div v-if="!chatStore.activeRoom.value">Select a Room</div>
  <v-container v-else>
    <v-card>
      <v-toolbar>
        <v-toolbar-title
          >Room: {{ chatStore.activeRoom.value.name }}</v-toolbar-title
        >
      </v-toolbar>
      <v-card-text ref="chatView" id="chatView" class="ma-0 pa-0">
        <v-list v-if="chatStore.activeRoom.value.messages">
          <v-list-item
            class="mb-5"
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
const signalR = useSignalR();
const appStore = useAppStore();

const msg = ref("");

const pushMessage = () => {
  signalR.sendMessage(msg.value);
  msg.value = "";
  scrollToBottom();
};

const scrollToBottom = () => {
  const chatSection = document.getElementById("chatView");
  if (chatSection) {
    setTimeout(() => {
      chatSection.scrollTop = chatSection.scrollHeight;
    }, 0);
  }
};
</script>
