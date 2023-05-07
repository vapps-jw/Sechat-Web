<template>
  <v-badge
    v-if="
      chatStore.getContacts.find(
        (ou) =>
          ou.displayName === props.roomMember.userName &&
          ou.contactState === ContactState.Online
      )
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

interface PropsModel {
  roomMember: IMemeber;
}

const props = defineProps<PropsModel>();
</script>

<style scoped></style>
