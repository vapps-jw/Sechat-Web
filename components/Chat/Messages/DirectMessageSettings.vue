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
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
const chatStore = useSechatChatStore();
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();

// watch(getActiveContact, async (newVal, oldVal) => {
//   console.log("Active contact changed", newVal, oldVal);
//   if (newVal === undefined) {
//     return;
//   }
//   if (chatStore.getActiveContact.encryptedByUser) {
//     chatData.value.userEncrypted = true;
//     chatData.value.chatKey = e2e.getCookie(
//       chatStore.getActiveContact.id,
//       CustomCookies.E2EDM
//     )?.key;
//   } else {
//     chatData.value.userEncrypted = false;
//     chatData.value.chatKey = "";
//   }
// });

onMounted(async () => {});

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

const applyChanges = async () => {};
</script>

<style scoped></style>
