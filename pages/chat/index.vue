<template>
  <div>
    <p>chat</p>
    <v-btn to="/">Go to Home</v-btn>

    <v-btn @click="test">Open connection</v-btn>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const signalr = useSignalR();

const test = () => {
  signalr.openConnection();
};
</script>

<style scoped></style>
