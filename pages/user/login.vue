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
    <v-btn
      @click="
        async () => await signIn(credentials.username, credentials.password)
      "
      >Sign In</v-btn
    >
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
</script>

<style scoped></style>
