<template>
  <chat-messages-tip-tap-options :editor="editor" />
  <editor-content :editor="editor" />
  <div class="d-flex justify-center">
    <p class="tiny-font">
      {{ editor?.storage.characterCount.characters() }} / {{ limit }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    const isSame = newValue === oldValue;
    if (isSame) {
      return;
    }
    let content = newValue.replace(/\s/g, "\u00a0");
    editor.value?.commands.setContent(content, false);
  }
);

const limit = 3000;
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link,
    Underline,
    Image,
    CharacterCount.configure({
      limit: limit,
    }),
  ],
  onUpdate: ({ editor }) => {
    let content = editor.getHTML();
    emit("update:modelValue", content);
  },
});

onUnmounted(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.tiny-font {
  font-size: xx-small;
}
</style>
