<template>
  <div>
    <p>login</p>
    <v-text-field
      label="Username"
      v-model="credentials.username"
    ></v-text-field>
    <v-text-field
      label="Password"
      v-model="credentials.password"
    ></v-text-field>

    <NuxtErrorBoundary>
      <v-btn
        @click="
          async () => await signIn(credentials.username, credentials.password)
        "
        >Sign In</v-btn
      >
      <template #error="{ error }">
        <div>
          <h1>Sorry Error</h1>
          <code>{{ error }}</code>
          <v-btn @click="handleClientError(error)">Go Back</v-btn>
        </div>
      </template>
    </NuxtErrorBoundary>
  </div>
</template>

<script setup lang="ts">
const { signIn } = useUserData();
const config = useRuntimeConfig();

interface ICredentials {
  username: string;
  password: string;
}

const credentials = reactive<ICredentials>({ username: "", password: "" });

const handleClientError = (error: any) => {
  error.value = null;
};
</script>

<style scoped></style>
