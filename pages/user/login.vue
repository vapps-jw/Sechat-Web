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
    <v-btn @click="login">Sign In</v-btn>
  </div>
</template>

<script setup lang="ts">
const { setUserData } = useUserData();
const config = useRuntimeConfig();

interface ICredentials {
  username: string;
  password: string;
}

const credentials = reactive<ICredentials>({ username: "", password: "" });

const login = async () => {
  const { error: loginError } = await useFetch(
    `${config.public.apiBase}/account/login`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        username: credentials.username,
        password: credentials.password,
      },
    }
  );

  if (loginError.value) {
    throw createError({
      ...loginError.value,
      statusMessage: "--> Login Failed",
    });
  }

  const { data: newProfile, error: profileFetchError } =
    await useFetch<IUserProfile>(`${config.public.apiBase}/user/get-profile`, {
      credentials: "include",
    });

  if (profileFetchError.value) {
    throw createError({
      ...profileFetchError.value,
      statusMessage: "--> Profile Fetch Failed",
    });
  }

  setUserData(newProfile.value);
  if (newProfile.value) {
    console.log("navigating to chat");
    navigateTo("/chat");
  }
};
</script>

<style scoped></style>
