<template>
  <v-container
    v-if="!chatStore.getActiveRoom && !chatStore.getActiveContact"
    class="bg-transparent d-flex justify-center align-center flex-column sechat-v-card-full"
  >
    <v-img
      :max-height="100"
      :width="300"
      src="/logos/logo-only-transparent-300x300-cropped.png"
    ></v-img>
    <div class="text-h6">E2E Encrypted World</div>
  </v-container>
  <v-container class="d-flex justify-center align-center" v-else>
    <ChatTabsVariantsRoomMessagesView
      v-if="chatStore.getActiveRoom && !chatStore.getActiveContact"
    />
    <ChatTabsVariantsDirectMessagesView
      v-if="!chatStore.getActiveRoom && chatStore.getActiveContact"
    />
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
</script>
