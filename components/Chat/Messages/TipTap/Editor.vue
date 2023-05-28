<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

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
    editor.value?.commands.setContent(newValue, false);
  }
);

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit, Link],
  onUpdate: ({ editor }) => {
    let content = editor.getHTML();
    emit("update:modelValue", content);
  },
});

onUnmounted(() => {
  editor.value?.destroy();
});
</script>

<style scoped></style>
