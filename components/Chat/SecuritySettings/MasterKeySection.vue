<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="warning"
      variant="tonal"
      title="Master Key"
      text="This key is being stored on your device. It is used to encrypt Calendar data. If you are logged in on different devices you have to be online on both to sync the key between them. You can reset the Master Key at any time, all data encrypted with the old Key will be deleted."
    ></v-alert>
    <v-card>
      <div v-if="masterKeys.length !== 0">
        <v-list lines="one">
          <v-list-item
            v-for="item in masterKeys"
            :title="new Date(item.id).toLocaleString(appStore.localLanguage)"
            >{{ item.key }}</v-list-item
          >
        </v-list>
      </div>

      <v-card-actions class="d-flex flex-column align-center justify-center">
        <v-dialog v-model="resetDialog" persistent width="500">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" variant="flat" class="my-2"
              >Create New Key</v-btn
            >
          </template>
          <v-card>
            <v-card-title class="text-h6 text-center">
              Reset Master Key?
            </v-card-title>
            <v-card-text>
              This cannot be reversed, all data encrypted with the current key
              will be permanently removed and new Key will be
              created.</v-card-text
            >
            <v-card-actions>
              <v-btn @click="resetDialog = false" variant="tonal">
                Abort
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn variant="tonal" @click="getNewMasterKey">
                Get New Key
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" persistent width="500">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" class="my-2" variant="flat"
              >Delete Key</v-btn
            >
          </template>
          <v-card>
            <v-card-title class="text-h6 text-center">
              Delete Master Key?
            </v-card-title>
            <v-card-text>
              This cannot be reversed, all data encrypted with this key will be
              permanently removed.</v-card-text
            >
            <v-card-actions>
              <v-btn @click="deleteDialog = false" variant="tonal">
                Abort
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn variant="tonal" class="my-2" @click="deleteMasterKey">
                Delete Key
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-btn @click="forceSync" variant="tonal" class="my-2">
          Force Sync
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { LocalStoreTypes } from "~/utilities/globalEnums";

const deleteDialog = ref<boolean>(false);
const resetDialog = ref<boolean>(false);
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const e2e = useE2Encryption();
const appStore = useSechatAppStore();
const masterKeys = ref<E2EKey[]>([]);
const refreshHandler = useRefreshHandler();
const calendarStore = useCalendarStore();
const calendarApi = useCalendarApi();

onMounted(async () => {
  updateKeysTable();
});

const clearEncryptedData = () => {
  try {
    calendarApi.clearCalendar();
    calendarStore.$reset();
    sechatStore.showSuccessSnackbar("Data cleared");
  } catch (error) {
    sechatStore.showErrorSnackbar("Data not cleared");
  }
};

const updateKeysTable = () => {
  const keys = e2e.getKeys(LocalStoreTypes.E2EMASTER);
  console.log("Updating Table", keys);
  if (keys.length === 0) {
    console.log("No Keys");
    masterKeys.value = <E2EKey[]>[];
    return;
  }

  const mostRecentKey = keys.reduce((a, b) => {
    return new Date(a.id) > new Date(b.id) ? a : b;
  });
  masterKeys.value = [mostRecentKey];
};

const deleteMasterKey = () => {
  e2e.removeKeys(LocalStoreTypes.E2EMASTER);
  updateKeysTable();
  clearEncryptedData();
  deleteDialog.value = false;
};

const forceSync = () => {
  console.log("Forcing sync");
  e2e.syncWithOtherDevice();
  updateKeysTable();
};

const getNewMasterKey = async () => {
  const { error: apiError, data: resData } = await useFetch(
    `${config.public.apiBase}/crypto/reset-default-key`,
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

  const newKey = await e2e.getNewKey();
  const newKeyData: E2EKey = {
    id: new Date().toISOString(),
    key: newKey,
  };

  clearEncryptedData();
  e2e.removeKeys(LocalStoreTypes.E2EMASTER);
  e2e.addKey(newKeyData, LocalStoreTypes.E2EMASTER);
  updateKeysTable();
  sechatStore.showSuccessSnackbar("Master Key updated");
  resetDialog.value = false;
};
</script>

<style scoped></style>
