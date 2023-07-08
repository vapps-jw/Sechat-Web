<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-cog" variant="outlined"></v-btn>
    </template>

    <v-card>
      <v-toolbar>
        <v-toolbar-title>Chat Settings</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form ref="chatSettingsForm" @submit.prevent>
          <v-alert
            class="mt-2 alert-font"
            density="compact"
            type="info"
            variant="tonal"
            title="Encryption"
            text="Secure your chat with a password for end-to-end encryption, your contact must know this password and unlock the chat on their side"
          ></v-alert>
          <v-alert
            class="mt-2 alert-font"
            density="compact"
            type="info"
            variant="tonal"
            title="E2E"
            text="All previous messages will be deleted on change"
          ></v-alert>
          <v-checkbox
            v-model="chatData.userEncrypted"
            label="Use end-to-end encryption"
          ></v-checkbox>
          <v-text-field
            v-if="chatData.userEncrypted"
            @click:append="keyBox = !keyBox"
            :append-icon="keyBox ? 'mdi-eye' : 'mdi-eye-off'"
            :type="keyBox ? 'text' : 'password'"
            v-model="chatData.chatKey"
            :rules="chatData.chatKeyRules"
            clearable
            :counter="100"
            label="Chat Secret Key"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn variant="tonal" @click="applyChanges"> Apply </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
const keyBox = ref<boolean>(false);
const chatStore = useSechatChatStore();

const chatSettingsForm = ref<HTMLFormElement>();
const chatData = ref({
  valid: true,
  userEncrypted: false,
  chatKey: "",
  chatKeyRules: [
    (v) =>
      (v && v.length <= 100) || "Chat Key must have less than 100 characters",
  ],
});

onMounted(async () => {
  if (chatStore.getActiveContact.encryptedByUser) {
    chatData.value.userEncrypted = true;
  }
});

const applyChanges = async () => {
  const { valid } = await chatSettingsForm.value?.validate();
  if (!valid) {
    console.warn("--> Form not valid");
    return;
  }

  //   try {
  //     signalR.createRoom(
  //       {
  //         roomName: roomData.value.name,
  //         userEncrypted: roomData.value.userEncrypted,
  //       },
  //       roomData.value.roomKey
  //     );
  //   } catch (error) {
  //     console.error("--> Room creation error", error);
  //   }

  chatData.value.chatKey = "";
  dialog.value = false;
};
</script>

<style scoped></style>
