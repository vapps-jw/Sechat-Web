<template>
  <div>
    <v-btn @click="test">TEST</v-btn>
  </div>
</template>

<script setup lang="ts">
const test = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      console.log("success!");
    })
    .catch((e) => {
      console.log("e: ", e);
    });
};
</script>

<style scoped></style>
