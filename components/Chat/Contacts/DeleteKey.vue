<template>
  <v-btn @click="deleteKey" class="mx-1" color="warning">Delete Key</v-btn>
</template>

<script setup lang="ts">
import { LocalStoreTypes } from "~~/utilities/globalEnums";
const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();

interface PropsModel {
  contact: IContactRequest;
}
const props = defineProps<PropsModel>();

const deleteKey = () => {
  try {
    e2e.removeKey(props.contact.id, LocalStoreTypes.E2EDM);
    props.contact.hasKey = false;
    sechatStore.showSuccessSnackbar("Key Deleted");
  } catch (error) {
    sechatStore.showErrorSnackbar("Errow when deleting Key");
  }
};
</script>

<style scoped></style>
