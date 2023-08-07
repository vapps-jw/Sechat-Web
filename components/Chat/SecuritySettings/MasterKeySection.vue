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
            :subtitle="item.key"
          ></v-list-item>
        </v-list>
      </div>

      <v-card-actions>
        <v-btn @click="getNewMasterKey" color="success" variant="outlined">
          Reset Key
        </v-btn>
        <v-btn @click="deleteMasterKey" color="error" variant="outlined">
          Delete Key
        </v-btn>
        <v-spacer />
        <v-btn @click="forceSync" color="success" variant="outlined">
          Force Sync
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { LocalStoreTypes } from "~/utilities/globalEnums";

const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const e2e = useE2Encryption();
const appStore = useSechatAppStore();
const masterKeys = ref<E2EKey[]>([]);

onMounted(async () => {
  updateKeysTable();
});

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
};

const forceSync = () => {
  console.log("Forcing sync");
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

  e2e.removeKeys(LocalStoreTypes.E2EMASTER);
  e2e.addKey(newKeyData, LocalStoreTypes.E2EMASTER);
  updateKeysTable();
  sechatStore.showSuccessSnackbar("Master Key updated");
};
</script>

<style scoped></style>
