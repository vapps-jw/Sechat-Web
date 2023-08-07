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
      <v-table>
        <thead>
          <tr>
            <th class="text-left">Created</th>
            <th class="text-left">Key</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in masterKeys" :key="key.id">
            <td>
              {{ new Date(key.id).toLocaleString(appStore.localLanguage) }}
            </td>
            <td>{{ key.key }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-card-actions>
        <v-btn @click="getNewMasterKey" color="success" variant="outlined">
          Reset Key
        </v-btn>
        <v-spacer />
        <v-btn @click="" color="success" variant="outlined">
          Try to Sync
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

const updateKeysTable = (): E2EKey[] => {
  const keys = e2e.getKeys(LocalStoreTypes.E2EMASTER);
  if (keys.length === 0) {
    return [];
  }

  const mostRecentKey = keys.sort((a, b) => Number(b.id) - Number(a.id))[0];
  masterKeys.value = [mostRecentKey];
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
