<template>
  <v-dialog transition="dialog-bottom-transition" class="mb-15" width="auto">
    <template v-slot:activator="{ props }">
      <v-btn
        icon="mdi-emoticon-neutral-outline"
        size="x-small"
        variant="outlined"
        color="warning"
        v-bind="props"
      >
        <Icon name="twemoji:angry-face"
      /></v-btn>
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
import { Editor } from "@tiptap/vue-3";

const props = defineProps({
  editor: {
    type: Editor,
    default: null,
  },
});

const onSelectEmoji = (emoji) => {
  console.log(emoji);
  if (!emoji.i || emoji.i === "null") {
    return;
  }

  props.editor?.commands.insertContent(emoji.i);
  // const chatStore = useSechatChatStore();
  // if (chatStore.newMessage) {
  //   chatStore.newMessage += emoji.i;
  // } else {
  //   chatStore.newMessage = emoji.i;
  // }
};
</script>

<style scoped></style>
