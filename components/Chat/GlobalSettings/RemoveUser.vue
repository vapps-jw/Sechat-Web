<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Remove User Users"
    ></v-alert>
    <v-card>
      <v-card-text class="px-0 py-1">
        <v-combobox
          class="pb-0"
          v-model="chosenValue"
          :loading="loading"
          label="Combobox"
          :items="comboboxData"
        ></v-combobox>
      </v-card-text>
      <v-card-actions class="px-0 py-1">
        <v-btn @click="getUserNames">Load Users</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="removeUser">Remove</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();

const chosenValue = ref<string>("");
const loading = ref<boolean>(false);
const comboboxData = ref<string[]>([]);

const getUserNames = async () => {
  console.log("Getting Link Preview from API");
  try {
    const { error: apiError, data: userNames } = await useFetch<string[]>(
      `${config.public.apiBase}/admin/usernames`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (apiError.value) {
      console.error("API error", apiError.value);
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    console.log("users", userNames);
    comboboxData.value = userNames.value;

    sechatStore.showSuccessSnackbar("Users Loaded");
  } catch (error) {
    sechatStore.showErrorSnackbar(error.statusMessage);
  }
};

const removeUser = async () => {
  console.log("Deleting User", chosenValue);

  if (!chosenValue.value) {
    sechatStore.showWarningSnackbar("Choose User");
    return;
  }

  try {
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/admin/delete-account/${chosenValue.value}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (apiError.value) {
      console.error("API error", apiError.value);
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    await getUserNames();
    chosenValue.value = "";
    sechatStore.showSuccessSnackbar("User deleted");
  } catch (error) {
    sechatStore.showErrorSnackbar(error.statusMessage);
  }
};
</script>

<style scoped></style>
