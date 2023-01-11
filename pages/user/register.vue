<template>
  <div>
    <p>register</p>
    <v-text-field
      label="Username"
      v-model="credentials.username"
    ></v-text-field>
    <v-text-field
      label="Password"
      v-model="credentials.password"
    ></v-text-field>
    <v-btn @click="register">Sign Up</v-btn>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

interface ICredentials {
  username: string;
  password: string;
}

const credentials = reactive<ICredentials>({ username: "", password: "" });
const register = async () => {};
</script>

<style scoped></style>
