<template>
  <v-container class="d-flex flex-column align-center">
    <v-btn
      v-if="userStore.isSignedIn"
      class="my-2"
      size="large"
      color="warning"
    >
      <NuxtLink class="sechat-link-clear" :to="`/chat`">SECHAT</NuxtLink>
    </v-btn>

    <v-btn v-if="userStore.isSignedIn" class="my-2" size="large">
      <NuxtLink class="sechat-link-clear" :to="`/user/changePassword`"
        >Change Password</NuxtLink
      >
    </v-btn>
    <v-btn
      v-if="userStore.isSignedIn"
      class="my-2"
      size="large"
      @click="signOut"
      >Sign Out</v-btn
    >
    <v-btn v-if="!userStore.isSignedIn" class="my-2" size="large">
      <NuxtLink class="sechat-link-clear" :to="`/user/login`">Sign In</NuxtLink>
    </v-btn>
    <v-btn v-if="!userStore.isSignedIn" class="my-2" size="large">
      <NuxtLink class="sechat-link-clear" :to="`/user/register`"
        >Sign Up</NuxtLink
      >
    </v-btn>
    <v-btn class="my-2" size="large">
      <NuxtLink class="sechat-link-clear" :to="`/details/about`"
        >About</NuxtLink
      >
    </v-btn>
    <v-btn v-if="!userStore.isSignedIn" class="my-2" size="large">
      <NuxtLink class="sechat-link-clear" :to="`/user/forgotPassword`"
        >Forgot Password</NuxtLink
      >
    </v-btn>

    <v-btn class="my-2" size="large">
      <NuxtLink class="sechat-link-clear" :to="`policies`">Policies</NuxtLink>
    </v-btn>
    <v-btn @click="rejectCookies" class="my-2" size="large"
      >Reject Cookies
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { CustomCookies } from "~/utilities/globalEnums";

const config = useRuntimeConfig();
const userStore = useUserStore();
const chatStore = useSechatChatStore();
const appStore = useSechatAppStore();
const signalRStore = useSignalRStore();
const webRTCStore = useWebRTCStore();

const rejectCookies = () => {
  const gdprCookie = useCookie(CustomCookies.GDPR);
  gdprCookie.value = null;
  window.location.reload();
};

const signOut = async () => {
  console.log("Signing Out");
  try {
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/account/logout`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
      }
    );

    if (apiError.value && apiError.value.statusCode !== 405) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    await signalRStore.closeConnection();
    console.warn("Resetting chatStore");
    chatStore.$reset();
    console.warn("Resetting signalRStore");
    signalRStore.$reset();
    console.warn("Resetting webRTCStore");
    webRTCStore.$reset();
    console.warn("Resetting userStore");
    userStore.$reset();
    appStore.showSuccessSnackbar(`${userStore.getUserName} logged out`);
  } catch (error) {
    appStore.showErrorSnackbar(error);
  }
};
</script>
