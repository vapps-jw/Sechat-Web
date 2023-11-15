<template>
  <v-container class="my-0 py-0 d-flex justify-start align-center">
    <Icon
      color="gold"
      font-size="0.1em"
      name="svg-spinners:3-dots-bounce"
      class="mr-2"
    />
    <p class="small-font">{{ chatStore.typingUsers.toString() }}</p>
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
</script>

<style scoped></style>
