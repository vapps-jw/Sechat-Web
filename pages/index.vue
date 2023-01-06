<template>
  <div>
    <v-btn @click="login">Login</v-btn>
    <v-btn @click="test">Test</v-btn>
  </div>
</template>

<script setup lang="ts">
const login = () => {
  fetch("https://localhost:5100/auth/login", {
    method: "post",
    credentials: "include",
  });
};
const test = () => {
  fetch("https://localhost:5100/auth/test", { credentials: "include" });
};
</script>

<style scoped></style>
