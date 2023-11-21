<template>
  <v-dialog transition="dialog-bottom-transition" class="mb-15" width="auto">
    <template v-slot:activator="{ props }">
      <v-btn
        class="mr-4"
        icon="mdi-emoticon-neutral-outline"
        size="small"
        variant="outlined"
        color="warning"
        v-bind="props"
      ></v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <EmojiPicker
        class="ma-0 pa-0"
        theme="dark"
        :native="true"
        @select="onSelectEmoji"
      />
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import "vue3-emoji-picker/css";
import EmojiPicker from "vue3-emoji-picker";

const onSelectEmoji = (emoji) => {
  console.log(emoji);
  if (!emoji.i || emoji.i === "null") {
    return;
  }
  const chatStore = useSechatChatStore();
  chatStore.newMessage += emoji.i;
};
</script>

<style scoped></style>
