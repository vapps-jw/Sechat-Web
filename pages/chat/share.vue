<template>
  <v-container>
    <v-card class="sechat-v-card-full-h">
      <v-toolbar>
        <v-toolbar-title>Share</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-container class="ma-0 pa-0">
        <v-tabs
          mode="shift"
          color="primary"
          v-model="tab"
          grow
          centered
          stacked
          density="compact"
        >
          <v-tab value="rooms-share">
            <v-icon size="small">mdi-forum</v-icon>
            <span class="small-font">Rooms</span>
          </v-tab>

          <v-tab value="contacts-share">
            <v-icon size="small">mdi-account-group</v-icon>
            <span class="small-font">Contacts</span>
          </v-tab>
        </v-tabs>
      </v-container>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-window v-model="tab">
          <v-window-item key="rooms-share" value="rooms-share">
            <ChatShareRoomsList
              @share-target-selected-room="shareTargetUpdate"
            />
          </v-window-item>
          <v-window-item key="contacts-share" value="contacts-share">
            <ChatShareContactsList
              @share-target-selected-contact="shareTargetUpdate"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn
          icon="mdi-cancel"
          variant="outlined"
          color="error"
          @click="exitPage"
        ></v-btn>
        <v-spacer />
        <v-btn
          icon="mdi-share"
          variant="outlined"
          color="success"
          @click="share"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const tab = ref(null);
const route = useRoute();
const title = ref(route.query.title ? route.query.title : "");
const text = ref(route.query.text ? route.query.text : "");
const chatStore = useSechatChatStore();

definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});

const exitPage = () => {
  navigateTo("/chat");
};

const shareData = ref<IShareDetails>(null);
const shareTargetUpdate = (shareId: string | number) => {
  console.log("ShareTarget", shareId);
  shareData.value = {
    shareId: shareId,
    title: title.value,
    text: text.value,
  } as IShareDetails;
};

const share = () => {
  console.log("Share Tab", tab.value);
  if (tab.value === "contacts-share") {
    executeContactShare();
    return;
  }
  executeRoomShare();
};

const executeRoomShare = () => {
  console.log("Sharing to Room", shareData.value, shareData.value.shareId);
  if (!shareData.value || !shareData.value.shareId) {
    return;
  }
  chatStore.selectRoom(shareData.value.shareId as string);
  chatStore.newMessage = `${shareData.value.title} ${shareData.value.text} `;
  navigateTo("/chat");
};

const executeContactShare = () => {
  console.log("Sharing to Contact", shareData.value, shareData.value.shareId);
  if (!shareData.value || !shareData.value.shareId) {
    return;
  }
  chatStore.selectContact(shareData.value.shareId as number);
  chatStore.newMessage = `${shareData.value.title} ${shareData.value.text} `;
  navigateTo("/chat");
};
</script>

<style scoped></style>
