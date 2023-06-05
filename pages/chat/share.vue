<template>
  <v-container>
    <v-card class="sechat-v-card-full-h">
      <v-toolbar>
        <v-toolbar-title>Share</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-share"
          variant="outlined"
          @click="executeShare"
        ></v-btn>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-container>
          <ChatShareRoomsList @share-target-selected="shareTargetUpdate" />
        </v-container>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute();
const title = ref(route.query.title ? route.query.title : "");
const text = ref(route.query.text ? route.query.text : "");
const chatStore = useSechatChatStore();

definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const shareData = ref<IShareDetails>(null);
const shareTargetUpdate = (roomId: string) => {
  console.log("--> ShareTarget", roomId);
  shareData.value = {
    roomId: roomId,
    title: title.value,
    text: text.value,
  } as IShareDetails;
};

const executeShare = () => {
  if (!shareData.value) {
    return;
  }
  chatStore.selectRoom(shareData.value.roomId);
  chatStore.newMessage = `${shareData.value.title} ${shareData.value.text} `;
  navigateTo("/chat");
};
</script>

<style scoped></style>
