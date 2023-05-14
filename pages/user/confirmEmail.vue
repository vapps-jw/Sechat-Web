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
const userName = ref(route.query.userName ? route.query.userName : "");
const email = ref(route.query.email ? route.query.email : "");
const config = useRuntimeConfig();
const appStore = useSechatAppStore();

const message = ref("");

onMounted(async () => {
  console.warn("--> Confirmation request", userName.value, token.value);
  if (!userName.value || !token.value) {
    return;
  }

  console.log("--> Sending confirmation");
  const { error: apiError, data: apiData } = await useFetch(
    `${config.public.apiBase}/account/confirm-email`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        userName: userName.value,
        token: token.value,
        email: email.value,
      },
    }
  );

  if (apiError.value) {
    console.error("--> API Error", apiError.value.data);
    message.value = apiError.value.data;
    return;
  }
  message.value = <any>apiData.value;
});
</script>
