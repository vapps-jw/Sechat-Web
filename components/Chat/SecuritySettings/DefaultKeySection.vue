<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="warning"
      variant="tonal"
      title="Default Encryption Key"
      text="Reset the unique server encryption key, all data encrypted with the previous key will be removed"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-btn @click="resetServerKey" color="success" variant="outlined">
          Reset Key
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();

const resetServerKey = async () => {
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
  sechatStore.showSuccessSnackbar(resData.value as string);
};
</script>

<style scoped></style>
