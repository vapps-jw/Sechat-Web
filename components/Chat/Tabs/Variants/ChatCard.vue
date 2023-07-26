<template>
  <v-card
    @click="chatStore.activateNavBar(BottomNavBarSet.ChatNavBar)"
    min-height="150"
    class="ma-2"
    :color="
      chatStore.activeBottomNav === BottomNavBarSet.ChatNavBar ? 'accent' : ''
    "
  >
    <div class="d-flex flex-no-wrap justify-space-between">
      <div>
        <v-card-title class="text-h5"> Sechat Chat </v-card-title>
        <v-card-subtitle>Chat Web App</v-card-subtitle>
      </div>

      <v-avatar class="ma-3" size="125" rounded="0">
        <NuxtImg
          src="/logos/logo-only-transparent-300x300.png"
          alt=""
          width="100"
          height="100"
        ></NuxtImg>
      </v-avatar>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { BottomNavBarSet } from "~~/utilities/globalEnums";
const chatStore = useSechatChatStore();
</script>

<style scoped></style>
