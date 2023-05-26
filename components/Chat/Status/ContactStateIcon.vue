<template>
  <v-icon
    v-if="props.contact.contactState === ContactState.Offline"
    color="error"
    size="x-small"
    >mdi-web-off</v-icon
  >
  <v-icon
    v-else-if="props.contact.contactState === ContactState.Online"
    color="success"
    size="x-small"
    >mdi-web-check</v-icon
  >
  <v-icon
    v-else-if="props.contact.contactState === ContactState.Unknown"
    color="tertiary"
    size="x-small"
    >mdi-web-off</v-icon
  >
  <v-icon v-else color="success" size="x-small">mdi-web-off</v-icon>
</template>

<script setup lang="ts">
import { ContactState } from "~~/utilities/globalEnums";

interface PropsModel {
  contact: IContactRequest;
}

const props = defineProps<PropsModel>();
</script>

<style scoped></style>
