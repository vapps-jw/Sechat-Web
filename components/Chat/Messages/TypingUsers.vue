<template>
  <v-container class="my-0 py-0 d-flex justify-start align-center">
    <Icon name="svg-spinners:3-dots-bounce" class="mr-2" />
    <p class="small-font">{{ chatStore.typingUsers.toString() }}</p>
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();

interface PropsModel {
  userNames?: string[];
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
