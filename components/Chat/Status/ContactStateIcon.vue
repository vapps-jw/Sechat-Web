<template>
  <v-icon
    v-if="props.contact.contactState === ContactState.Offline"
    class="mr-2"
    color="error"
    size="x-small"
    >mdi-web-off</v-icon
  >
  <v-icon
    v-else-if="props.contact.contactState === ContactState.Online"
    class="mr-2"
    color="success"
    size="x-small"
    >mdi-web-check</v-icon
  >
  <v-icon
    v-else="props.contact.contactState === ContactState.Unknown"
    class="mr-2"
    color="success"
    size="x-small"
    >web-sync</v-icon
  >
</template>

<script setup lang="ts">
import { ContactState } from "~~/utilities/globalEnums";

interface PropsModel {
  contact: IContactRequest;
}

const props = defineProps<PropsModel>();
</script>

<style scoped></style>
