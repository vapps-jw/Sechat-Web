<template>
  <div class="d-flex align-center">
    <chat-messages-tip-tap-options :editor="editor" />
    <chat-messages-tip-tap-emoji-dialog :editor="editor" />
  </div>
  <editor-content
    data-cy="editor-content"
    v-if="!editorBusy"
    :editor="editor"
  />
  <v-progress-linear
    v-else
    class="my-4"
    color="warning"
    height="8"
    indeterminate
  ></v-progress-linear>
</template>

<script setup lang="ts">
import { findAll } from "~/utilities/stringFunctions";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { ImageTypes, SignalRHubMethods } from "~/utilities/globalEnums";
import { Node, mergeAttributes } from "@tiptap/core";

const chatApi = useChatApi();
const signalRStore = useSignalRStore();
const chatStore = useSechatChatStore();

const editorBusy = ref<boolean>(false);

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const Video = Node.create({
  name: "video",
  group: "block",
  selectable: true,
  draggable: false,
  atom: true, // is a single unit

  addAttributes() {
    return {
      src: {
        default: null,
      },
      poster: {
        default: null,
      },
      controls: {
        default: true,
      },
      class: {
        default: "message-video",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    console.warn("attributes", HTMLAttributes);
    return ["video", mergeAttributes(HTMLAttributes)];
  },
});

const emit = defineEmits(["update:modelValue", "editorStateUpdate"]);

const handleSharedImage = (content: string) => {
  console.log("Setting Image", content);
  editorBusy.value = true;

  editor.value?.commands.setImage({
    src: content,
  });

  editorBusy.value = false;
  emit("editorStateUpdate", {
    busy: false,
    editable: false,
    readyToShare: false,
  });
};

const handleSharedVideo = (video: string) => {
  console.log("Setting Video");
  editorBusy.value = true;

  const splittedData = video.split("###");

  editor.value?.commands.updateAttributes("video", { class: "message-video" });
  editor.value?.commands.insertContent(
    `<video src="${splittedData[0]}" poster="${splittedData[1]}"></video>`
  );

  editorBusy.value = false;
  emit("editorStateUpdate", {
    busy: false,
    editable: false,
    readyToShare: false,
  });
};

onMounted(async () => {
  console.warn("Editor Mounted", props.modelValue);
  if (chatStore.schareApiTriggered) {
    try {
      console.warn("Share triggered", chatStore.schareApiData);
      await handleAnchors([
        [chatStore.schareApiData.title, chatStore.schareApiData.text],
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      chatStore.clearShareApiData();
    }
  }
});

const handleEditorWatcher = async (newValue, oldValue) => {
  const isSame = newValue === oldValue;
  if (isSame || editorBusy.value || chatStore.schareApiTriggered) {
    return;
  }

  let content = newValue;

  const imageSources = findAll(/<img.*?src="(.*?)"/g, props.modelValue);
  const videoSources = findAll(/<video.*?src="(.*?)"/g, props.modelValue);

  console.log("Image sources", imageSources.length);
  console.log("Video sources", videoSources.length);

  console.log("New Message", newValue);

  if (imageSources.length > 0) {
    return;
  }

  if (videoSources.length > 0) {
    return;
  }

  if (newValue) {
    if (chatStore.activeContactId) {
      signalRStore.connection?.send(SignalRHubMethods.ImTypingDirectMessage, {
        id: chatStore.activeContactId,
      });
    } else if (chatStore.activeRoomId) {
      signalRStore.connection?.send(SignalRHubMethods.ImTypingRoomMessage, {
        id: chatStore.activeRoomId,
      });
    }
  }

  if (
    oldValue &&
    oldValue.includes(ImageTypes.ChatImage) &&
    newValue.includes(ImageTypes.ChatImage)
  ) {
    return;
  }

  if (content.includes(ImageTypes.ChatImage)) {
    console.log("Handlin image");
    handleSharedImage(content);
    return;
  }

  if (content.includes(ImageTypes.ChatViedo)) {
    console.log("Handlin video");
    handleSharedVideo(content);
    return;
  }

  console.log("Setting content", props.modelValue);
  editor.value?.commands.setContent(content, false, {
    preserveWhitespace: "full",
  });

  if (!newValue) {
    console.log("Editor Empty");
    editor.value?.setOptions({ editable: true });
    emit("editorStateUpdate", {
      busy: false,
      editable: true,
      readyToShare: false,
    });
    return;
  }

  const anchors = findAll(/<a[^>]*href=["']([^"']*)["']/g, content);
  console.log("Checking links", anchors);

  await handleAnchors(anchors);
};

const handleAnchors = async (anchors: any[]) => {
  if (anchors.length > 0) {
    if (editorBusy.value) {
      console.error("Prev Busy");
      return;
    }

    editorBusy.value = true;

    editor.value?.setOptions({ editable: false });
    emit("editorStateUpdate", {
      busy: true,
      editable: false,
      readyToShare: false,
    });

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

          if (prev.title) {
            editor.value?.commands.insertContent(`<h4>${prev.title}</h4>`);
          }

          if (prev.url && chatStore.schareApiTriggered) {
            console.warn("Setting URL", prev.url);
            editor.value?.commands.insertContent(`<h5>${prev.url}</h4>`);
          }

          if (prev.description) {
            editor.value?.commands.insertContent(
              `<h5>${prev.description}</h5>`
            );
          }

          console.warn("Setting image", prev.img);
          if (prev.img) {
            editor.value?.commands.setImage({
              src: prev.img,
              alt: prev.domain,
              title: prev.title,
            });
          } else {
            if (prev.favicon) {
              editor.value?.commands.setImage({
                src: prev.favicon,
              });
            }
          }

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
            editable: true,
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
};

watch(
  () => props.modelValue,
  async (newValue, oldValue) => {
    await handleEditorWatcher(newValue, oldValue);
  }
);

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
      allowBase64: true,
      HTMLAttributes: {
        class: "link-preview-img",
      },
    }),
    Video,
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
