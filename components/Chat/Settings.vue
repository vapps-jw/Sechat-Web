<template>
  <div>
    <v-btn to="/">Go to Home</v-btn>
    <v-btn @click="testSnackbar">Test snackbar</v-btn>
  </div>
</template>

<script setup lang="ts">
const signalr = useSignalR();
const chatApi = useChatApi();
const chatStore = useChatStore();
const appStore = useAppStore();

const testSnackbar = () => {
  appStore.showSnackbar({
    snackbar: true,
    text: "TEST",
    timeout: 2000,
    color: "warning",
  });
};
</script>

<style scoped></style>
