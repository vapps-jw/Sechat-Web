<template>
  <chat-messages-tip-tap-options :editor="editor" />
  <editor-content v-if="!editorBusy" :editor="editor" />
  <v-progress-linear
    v-else
    color="warning"
    striped
    indeterminate
  ></v-progress-linear>
  <div class="d-flex justify-center">
    <p class="tiny-font">
      {{ editor?.storage.characterCount.characters() }} / {{ limit }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { findAll } from "~/utilities/stringFunctions";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";

const chatApi = useChatApi();

const editorBusy = ref<boolean>(false);
let generatedPreviews = [];

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "editorStateUpdate"]);

watch(
  () => props.modelValue,
  async (newValue, oldValue) => {
    const isSame = newValue === oldValue;
    if (isSame || editorBusy.value) {
      return;
    }
    let content = newValue.replace(/\s/g, "\u00a0");
    editor.value?.commands.setContent(content, false);

    if (!newValue) {
      console.log("Editor Empty");
      generatedPreviews = [];
      editor.value?.setOptions({ editable: true });
      emit("editorStateUpdate", {
        busy: false,
        editable: true,
        readyToShare: false,
      });
      return;
    }

    const anchors = findAll(/<a[^>]*href=["']([^"']*)["']/g, content);
    console.log("Anchors", anchors);
    if (anchors.length > 0) {
      if (editorBusy.value) {
        console.error("Prev Busy");
        return;
      }

      if (generatedPreviews.some((gp) => gp === anchors[0][1])) {
        console.log("This preview was generated");
        return;
      }

      editorBusy.value = true;
      editor.value?.setOptions({ editable: false });
      emit("editorStateUpdate", {
        busy: true,
        editable: false,
        readyToShare: false,
      });

      generatedPreviews.push(anchors[0][1]);

      try {
        console.warn("Generating Preview...", anchors);
        await chatApi
          .getLinkPreview(anchors[0][1])
          .then((prev) => {
            console.warn("PREV", prev);
            if (!prev || prev === undefined) {
              throw new Error("No prev");
            }

            console.warn("Setting Title", prev.title);
            editor.value?.commands.insertContent(
              `<h4>${prev.title}</h4><h5>${prev.description}</h5>`
            );

            console.warn("Setting image", prev.img);
            editor.value?.commands.setImage({
              src: prev.img,
              alt: prev.domain,
              title: prev.title,
            });
            emit("editorStateUpdate", {
              busy: false,
              editable: false,
              readyToShare: true,
            });
          })
          .catch((err) => {
            console.error(err);
            editor.value?.setOptions({ editable: true });
            emit("editorStateUpdate", {
              busy: false,
              editable: false,
              readyToShare: false,
            });
          });
      } catch (error) {
        editor.value?.setOptions({ editable: true });
        emit("editorStateUpdate", {
          busy: true,
          editable: true,
          readyToShare: false,
        });
      } finally {
        editorBusy.value = false;
      }
    }
  }
);

const limit = 3000;
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({
      linkOnPaste: true,
      openOnClick: true,
      autolink: true,
    }),
    Underline,
    Image.configure({
      HTMLAttributes: {
        class: "link-preview-img",
      },
    }),
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

<style scoped></style>
