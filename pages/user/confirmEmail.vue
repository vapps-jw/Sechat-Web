<template>
  <v-container class="bg-transparent">
    <div class="d-flex justify-center flex-wrap flex-column align-center">
      <div class="text-h6">{{ message }}</div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute();
const token = ref(route.query.token ? route.query.token : "");
const email = ref(route.query.email ? route.query.email : "");
const config = useRuntimeConfig();
const appStore = useSechatAppStore();

const message = ref("");

onMounted(async () => {
  console.warn("--> Confirmation request", email.value, token.value);
  if (!email || !token) {
    return;
  }

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/account/update-email`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        email: email.value,
        token: token.value,
      },
    }
  );

  if (apiError.value) {
    appStore.showErrorSnackbar(apiError.value.message);
    return;
  }

  appStore.showSuccessSnackbar(
    `Confirmation request sent to ${emailForm.value.email}`
  );
});
</script>
