<template>
  <v-container
    v-if="!chatStore.getActiveRoom && !chatStore.getActiveContact"
    class="bg-transparent d-flex justify-center align-center flex-column sechat-v-card-full"
  >
    <NuxtImg
      src="/logos/logo-only-transparent-300x300.png"
      alt=""
      width="300"
      height="150"
    ></NuxtImg>
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
