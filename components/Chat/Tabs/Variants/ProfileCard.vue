<template>
  <v-card
    @click="chatStore.activateNavBar(BottomNavBarSet.ProfileNavBar)"
    min-height="150"
    class="ma-2"
    :color="
      chatStore.activeBottomNav === BottomNavBarSet.ProfileNavBar
        ? 'accent'
        : ''
    "
  >
    <div class="d-flex flex-no-wrap justify-space-between">
      <div>
        <v-card-title class="text-h5"> Profile </v-card-title>
        <v-card-subtitle>Profile and Settings</v-card-subtitle>
      </div>

      <v-avatar class="ma-3" size="125" rounded="0">
        <ChatUserAvatar
          size="large"
          :active="false"
          :user-name="userStore.getUserName"
        />
      </v-avatar>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { BottomNavBarSet } from "~~/utilities/globalEnums";
const chatStore = useSechatChatStore();
const userStore = useUserStore();
</script>

<style scoped></style>
