<template>
  <v-badge
    v-if="
      chatStore.getContacts.find(
        (ou) =>
          ou.displayName === props.roomMember.userName &&
          ou.contactState === ContactState.Online
      ) || userStore.getUserName === props.roomMember.userName
    "
    dot
    color="success"
    location="bottom end"
  ></v-badge>
  <v-badge
    v-else-if="
      chatStore.getContacts.find(
        (ou) =>
          ou.displayName === props.roomMember.userName &&
          ou.contactState === ContactState.Offline
      )
    "
    dot
    color="error"
    location="bottom end"
  ></v-badge>
  <v-badge v-else dot color="tertiary" location="bottom end"></v-badge>
</template>

<script setup lang="ts">
import { ContactState } from "~~/utilities/globalEnums";
const chatStore = useSechatChatStore();
const userStore = useUserStore();

interface PropsModel {
  roomMember: IRoomMemeber;
}

const props = defineProps<PropsModel>();
</script>

<style scoped></style>
