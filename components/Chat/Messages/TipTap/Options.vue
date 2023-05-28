<template>
  <div v-if="editor" class="d-flex justify-left">
    <v-btn
      variant="plain"
      icon="mdi-format-bold"
      size="sx-mall"
      :color="editor.isActive('bold') ? 'success' : 'tertiary'"
      @click="editor.chain().focus().toggleBold().run()"
      :disabled="!editor.can().chain().focus().toggleBold().run()"
    ></v-btn>
    <v-btn
      variant="plain"
      icon="mdi-format-italic"
      size="sx-mall"
      :color="editor.isActive('italic') ? 'success' : 'tertiary'"
      @click="editor.chain().focus().toggleItalic().run()"
      :disabled="!editor.can().chain().focus().toggleItalic().run()"
    ></v-btn>
    <v-btn
      variant="plain"
      icon="mdi-format-underline"
      size="sx-mall"
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
