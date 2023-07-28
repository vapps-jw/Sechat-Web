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
            type="warning"
            variant="tonal"
            title="E2E"
            text="All previous messages will be deleted if you change encryption method"
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
        <v-alert
          class="alert-font"
          density="compact"
          type="warning"
          variant="tonal"
          title="Clear Chat"
          text="Delete all messages from this chat"
        ></v-alert>
        <div class="d-flex justify-center">
          <v-btn class="mt-4" color="error" size="small" @click="clearChat"
            >Clear Chat</v-btn
          >
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn variant="tonal" @click="applyChanges">Apply Changes </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { CustomCookies } from "~/utilities/globalEnums";

const dialog = ref<boolean>(false);
const keyBox = ref<boolean>(false);
const chatStore = useSechatChatStore();
const e2e = useE2Encryption();
const config = useRuntimeConfig();
const userStore = useUserStore();
const chatApi = useChatApi();
const sechatStore = useSechatAppStore();

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

const { getActiveContact } = storeToRefs(chatStore);
watch(getActiveContact, async (newVal, oldVal) => {
  console.log("Active contact changed", newVal, oldVal);
  if (newVal === undefined) {
    return;
  }
  if (chatStore.getActiveContact.encryptedByUser) {
    chatData.value.userEncrypted = true;
    chatData.value.chatKey = e2e.getCookie(
      chatStore.getActiveContact.id,
      CustomCookies.E2EDM
    )?.key;
  } else {
    chatData.value.userEncrypted = false;
    chatData.value.chatKey = "";
  }
});

onMounted(async () => {
  console.log("Chat settings mounted");
  if (chatStore.getActiveContact.encryptedByUser) {
    chatData.value.userEncrypted = true;
    chatData.value.chatKey = e2e.getCookie(
      chatStore.getActiveContact.id,
      CustomCookies.E2EDM
    )?.key;
  } else {
    chatData.value.userEncrypted = false;
    chatData.value.chatKey = "";
  }
});

const clearChat = async () => {
  const { error: apiError, data: resData } = await useFetch(
    `${config.public.apiBase}/chat/direct-messages/${chatStore.getActiveContact.id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    dialog.value = false;
    return;
  }

  sechatStore.showSuccessSnackbar(resData.value as string);
  dialog.value = false;
};

const applyChanges = async () => {
  const { valid } = await chatSettingsForm.value?.validate();
  if (!valid) {
    console.warn("--> Form not valid");
    return;
  }

  if (chatData.value.userEncrypted) {
    e2e.addKey(
      {
        key: chatData.value.chatKey,
        id: chatStore.getActiveContact.id,
      },
      CustomCookies.E2EDM
    );
  }

  if (
    chatData.value.userEncrypted === chatStore.getActiveContact.encryptedByUser
  ) {
    const updatedContact = await chatApi.getContact(chatStore.activeContactId);
    if (
      updatedContact.directMessages.length > 0 &&
      !updatedContact.directMessages
        .sort((a, b) => Number(b.id) - Number(a.id))
        .at(-1).error
    ) {
      chatStore.updateContact(updatedContact);
      chatStore.markDirectMessagesAsViewed(chatStore.activeContactId);
      await chatApi.markDirectMessagesAsViewed(chatStore.activeContactId);
    }
    dialog.value = false;
    return;
  }

  const { error: apiError, data: updatedContact } =
    await useFetch<IContactRequest>(
      `${config.public.apiBase}/user/contact-e2e/?contactId=${chatStore.getActiveContact.id}&e2e=${chatData.value.userEncrypted}`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );

  if (apiError.value) {
    throw createError({
      ...apiError.value,
      statusCode: apiError.value.statusCode,
      statusMessage: apiError.value.data,
    });
  }

  console.log("Updated contact", updatedContact.value);

  if (updatedContact.value.invitedName === userStore.userProfile.userName) {
    updatedContact.value.displayName = updatedContact.value.inviterName;
  } else {
    updatedContact.value.displayName = updatedContact.value.invitedName;
  }

  chatStore.updateContact(updatedContact.value);
  dialog.value = false;
};
</script>

<style scoped></style>
