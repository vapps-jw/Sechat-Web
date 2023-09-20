<template>
  <v-list>
    <v-list-item
      :border="true"
      class="my-2 mx-1 pa-1"
      v-for="uc in chatStore.getContacts"
      :key="`${uc.invitedName}-${uc.inviterName}`"
    >
      <template v-slot:title>
        <div class="small-font">
          {{ uc.displayName }}
        </div>
      </template>
      <template v-slot:prepend>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="plain"
              v-bind="props"
            ></v-btn>
          </template>
          <v-list>
            <v-list-item
              v-if="!uc.approved && uc.invitedName === userStore.getUserName"
            >
              <v-btn
                @click="async () => approveContact(uc.id)"
                class="mx-1"
                color="success"
                >Approve</v-btn
              ></v-list-item
            >

            <v-list-item v-if="uc.approved && !uc.blocked && uc.hasKey">
              <ChatContactsDeleteKey :contact="uc" />
            </v-list-item>

            <v-list-item v-if="uc.approved && !uc.blocked && !uc.hasKey">
              <ChatContactsGetNewKey :contact="uc" />
            </v-list-item>

            <v-list-item>
              <v-btn
                @click="async () => deleteContact(uc.id)"
                class="mx-1"
                color="error"
                >Delete</v-btn
              ></v-list-item
            >
            <v-list-item
              v-if="uc.blocked && uc.blockedByName === userStore.getUserName"
            >
              <v-btn
                @click="async () => allowContact(uc.id)"
                class="mx-1"
                color="success"
                >Allow</v-btn
              >
            </v-list-item>
            <v-list-item v-if="!uc.blocked">
              <v-btn
                @click="async () => blockContact(uc.id)"
                class="mx-1"
                color="error"
                >Block</v-btn
              >
            </v-list-item>
          </v-list>
        </v-menu>
        <div class="d-flex align-center justify-center mr-2 flex-column">
          <ChatUserAvatar
            :active="false"
            :user-name="uc.displayName"
            :picture="uc.profileImage"
            size="small"
          />
          <div class="d-flex align-center justify-center">
            <chat-status-contact-state-icon :contact="uc" />
            <v-icon v-if="uc.blocked" size="x-small" color="error"
              >mdi-alert-circle</v-icon
            >
            <v-icon v-else-if="uc.approved" size="x-small" color="success"
              >mdi-check-bold</v-icon
            >
            <v-icon v-else size="x-small" color="warning"
              >mdi-help-circle-outline</v-icon
            >
          </div>
        </div>
      </template>
      <template v-slot:append>
        <!-- <v-badge
          v-if="pendingMessagesPresent(uc)"
          class="mr-3"
          :model-value="pendingMessagesPresent(uc)"
          :content="pendingMessagesCount(uc)"
          color="error"
        >
          <v-icon>mdi-email</v-icon>
        </v-badge> -->
        <v-btn
          class="mr-3"
          v-if="uc.approved && !uc.blocked && uc.hasKey"
          @click="startVideoCall(uc)"
          size="small"
          icon="mdi-phone"
          color="success"
          variant="outlined"
        ></v-btn>

        <v-badge
          v-if="uc.approved && !uc.blocked && uc.hasKey"
          :model-value="pendingMessagesPresent(uc)"
          :content="pendingMessagesCount(uc)"
          color="error"
        >
          <v-btn
            v-if="uc.approved && !uc.blocked && uc.hasKey"
            @click="directMessage(uc)"
            size="small"
            :icon="dmIconType(uc)"
            :color="dmIconColor(uc)"
            variant="outlined"
          >
          </v-btn>
        </v-badge>
        <v-tooltip
          v-if="uc.approved && !uc.blocked && !uc.hasKey"
          v-model="keySyncTooltip"
          location="bottom"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              @click="keySyncInfo(uc.displayName)"
              v-bind="props"
              icon="mdi-key-wireless"
              color="warning"
              size="small"
              variant="outlined"
            >
            </v-btn>
          </template>
          <span>Waiting for other user to sync the key</span>
        </v-tooltip>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { LocalStoreTypes, SnackbarMessages } from "~~/utilities/globalEnums";

const keySyncTooltip = ref<boolean>(false);

const chatStore = useSechatChatStore();
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const userStore = useUserStore();
const webRTCStore = useWebRTCStore();
const e2e = useE2Encryption();

const startVideoCall = (uc: IContactRequest) => {
  console.log("Starting new call with", uc.displayName);
  webRTCStore.updateVideoCallContact(uc);
  webRTCStore.updateVideoCallViewVisible(true);
};

const keySyncInfo = (userName: string) => {
  sechatStore.showSnackbar(<ISanckbar>{
    snackbar: true,
    text: `${userName} has to be online to synchronize keys`,
    timeout: 1500,
    color: "warning",
    icon: "mdi-key-wireless",
    iconColor: "black",
  });
};

const dmIconType = (uc: IContactRequest): string => {
  if (uc.directMessages.some((m) => m.error)) {
    return "mdi-message-alert";
  }
  return "mdi-message";
};

const dmIconColor = (uc: IContactRequest): string => {
  if (uc.directMessages.some((m) => m.error)) {
    return "error";
  }
  return "primary";
};

const pendingMessagesPresent = (uc: IContactRequest): boolean => {
  return (
    uc.directMessages.filter(
      (m) => !m.wasViewed && m.nameSentBy !== userStore.getUserName
    ).length > 0
  );
};

const pendingMessagesCount = (uc: IContactRequest): number => {
  return uc.directMessages.filter(
    (m) => !m.wasViewed && m.nameSentBy !== userStore.getUserName
  ).length;
};

const directMessage = (uc: IContactRequest) => {
  chatStore.selectContact(uc.id);
};

const blockContact = async (id: number) => {
  console.log("Calling contact block");

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/block-contact/?contactId=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }
  sechatStore.showSuccessSnackbar("Contact blocked");
};

const allowContact = async (id: number) => {
  console.log("Calling contact block");
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/allow-contact/?contactId=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }
  sechatStore.showSuccessSnackbar(SnackbarMessages.Success);
};

const approveContact = async (id: number) => {
  console.log("Calling contact approve");
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/approve-contact/?contactId=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }

  sechatStore.showSuccessSnackbar("Contact approved");
};

const deleteContact = async (id: number) => {
  console.log("Deleting contact", id);
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/delete-contact/?contactId=${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }

  e2e.removeKey(id, LocalStoreTypes.E2EDM);
  sechatStore.showSuccessSnackbar("Contact deleted");
};
</script>

<style scoped></style>
