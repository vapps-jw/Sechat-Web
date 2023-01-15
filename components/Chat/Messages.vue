<template>
  <div v-if="!chatStore.activeRoom.value">Select a Room</div>
  <v-container v-else>
    <v-card>
      <v-toolbar>
        <v-toolbar-title
          >Room: {{ chatStore.activeRoom.value.name }}</v-toolbar-title
        >
      </v-toolbar>
      <v-card-text>
        <v-list ref="chat" id="logs">
          <v-list-item v-for="message in messages" :title="message">
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="sechat-message-input">
        <v-text-field v-model="msg" label="Message"></v-text-field>
        <v-btn icon="mdi-cached" color="info" @click="pushMsg"></v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useChatStore();

const messages = ref([]);
const msg = ref("");

const pushMsg = () => {
  messages.value.push(msg.value);
  msg.value = "";
};

watch(messages, (currentValue, oldValue) => {
  console.log("--> Current value", currentValue);
  console.log("--> New value", oldValue);
});
</script>

<style scoped></style>
