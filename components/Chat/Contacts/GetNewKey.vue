<template>
  <v-dialog v-model="dialog" persistent width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="warning" class="mx-1">Get New Key</v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h6 text-center">
        Create a new Key
      </v-card-title>
      <v-card-text
        >If you create a new Key previous messages will be erased</v-card-text
      >
      <v-card-actions>
        <v-btn color="success" variant="text" @click="dialog = false">
          Abort
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="createKey">
          Create New Key
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { LocalStoreTypes } from "~~/utilities/globalEnums";
const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();
const chatApi = useChatApi();
const dialog = ref<boolean>(false);

interface PropsModel {
  contact: IContactRequest;
}
const props = defineProps<PropsModel>();

const createKey = async () => {
  try {
    const newKey = await e2e.getNewKey();
    const newKeyData: E2EKey = {
      id: props.contact.id,
      key: newKey,
    };
    e2e.addKey(newKeyData, LocalStoreTypes.E2EDM);
    props.contact.hasKey = true;
    await chatApi.clearChat(props.contact.id);
    dialog.value = false;
    sechatStore.showSuccessSnackbar("Key Created");
  } catch (error) {
    sechatStore.showErrorSnackbar("Errow when creating Key");
  }
};
</script>

<style scoped></style>
