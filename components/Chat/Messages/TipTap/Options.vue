<template>
  <div v-if="editor" class="d-flex justify-left ma-1">
    <v-btn
      class="mr-2"
      size="x-small"
      variant="outlined"
      icon="mdi-format-bold"
      :color="editor.isActive('bold') ? 'success' : 'tertiary'"
      @click="editor.chain().focus().toggleBold().run()"
      :disabled="!editor.can().chain().focus().toggleBold().run()"
    ></v-btn>
    <v-btn
      class="mr-2"
      size="x-small"
      variant="outlined"
      icon="mdi-format-italic"
      :color="editor.isActive('italic') ? 'success' : 'tertiary'"
      @click="editor.chain().focus().toggleItalic().run()"
      :disabled="!editor.can().chain().focus().toggleItalic().run()"
    ></v-btn>
    <v-btn
      class="mr-2"
      size="x-small"
      variant="outlined"
      icon="mdi-format-underline"
      :color="editor.isActive('underline') ? 'success' : 'tertiary'"
      @click="editor.chain().focus().toggleUnderline().run()"
      :disabled="!editor.can().chain().focus().toggleUnderline().run()"
    ></v-btn>
  </div>
</template>

<script setup lang="ts">
import { Editor } from "@tiptap/vue-3";

const props = defineProps({
  editor: {
    type: Editor,
    default: null,
  },
});
</script>

<style scoped></style>
