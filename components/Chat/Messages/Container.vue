<template>
  <v-sheet id="chatView" class="ma-0 pr-1 overflow-auto">
    <div v-for="(m, index) in props.messages">
      <v-row
        v-if="
          index === 0 ||
          new Date(props.messages[index - 1].created).setHours(0, 0, 0, 0) !==
            new Date(m.created).setHours(0, 0, 0, 0)
        "
        no-gutters
        class="flex-nowrap align-center my-3"
      >
        <v-col cols="5" class="flex-grow-0 flex-shrink-1 ml-2">
          <v-divider color="tertiary"></v-divider>
        </v-col>

        <v-col
          style="min-width: 150px"
          cols="2"
          class="d-flex flex-grow-1 flex-shrink-0 justify-center align-center"
        >
          <v-sheet class="mx-3">
            <div class="tiny-font text-primary">
              {{
                new Date(m.created).toLocaleString(appStore.localLanguage, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="5" class="flex-grow-0 flex-shrink-1">
          <v-divider color="tertiary"></v-divider>
        </v-col>
      </v-row>
      <chat-messages-message :message="m" v-if="chatStore.activeRoomId" />
      <chat-messages-direct-message
        :message="m"
        v-if="chatStore.activeContactId"
      />
    </div>
  </v-sheet>
  <div
    v-if="props.messages.length > 10"
    class="d-flex justify-end align-center"
  ></div>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
const chatStore = useSechatChatStore();

interface PropsModel {
  messages: IMessageBase[];
}
const props = defineProps<PropsModel>();

const scrollToBottom = () => {
  const chatSection = document.getElementById("chatView");
  if (chatSection) {
    setTimeout(() => {
      chatSection.scrollTop = chatSection.scrollHeight;
    }, 0);
  }
};

onUpdated(() => {
  scrollToBottom();
});

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.container-style {
  height: 42dvh;
}
</style>
