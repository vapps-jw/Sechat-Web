<template>
  <v-container class="d-flex flex-column align-center">
    <!-- <v-btn
      v-if="userStore.isSignedIn"
      class="my-2"
      size="large"
      color="warning"
    >
      <NuxtLink class="sechat-link-clear" :to="`/chat`">SECHAT</NuxtLink>
    </v-btn> -->
    <v-btn
      v-if="userStore.isSignedIn"
      class="my-2"
      size="large"
      color="warning"
      @click="goToChat"
    >
      SECHAT
    </v-btn>

    <!-- <v-btn
      v-if="userStore.isSignedIn"
      class="my-2"
      size="large"
      color="warning"
    >
      <NuxtLink class="sechat-link-clear" :to="`/games`">GAMES</NuxtLink>
    </v-btn> -->

    <v-btn v-if="userStore.isSignedIn" class="my-2" size="large">
      <NuxtLink class="sechat-link-clear" :to="`/user/changePassword`"
        >Change Password</NuxtLink
      >
    </v-btn>
    <v-btn
      data-cy="sign-out"
      v-if="userStore.isSignedIn"
      class="my-2"
      size="large"
      @click="signOut"
      >Sign Out</v-btn
    >
    <ChatDeleteAccount
      v-if="userStore.isSignedIn"
      @account-delete-requested="() => deleteAccount()"
    />
    <v-btn
      data-cy="sign-in"
      v-if="!userStore.isSignedIn"
      class="my-2"
      size="large"
    >
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
import { LocalStoreTypes } from "~/utilities/globalEnums";
import { SnackbarMessages } from "~~/utilities/globalEnums";

const referralRequired = ref<boolean>();
const config = useRuntimeConfig();
const userStore = useUserStore();
const appStore = useSechatAppStore();
const refreshHandler = useRefreshHandler();
const app = useSechatApp();
const sechatStore = useSechatAppStore();

const rejectCookies = async () => {
  app.removeLocalStoreItem(LocalStoreTypes.GDPR);
  appStore.GDPR = false;
  await signOut();
  window.location.reload();
};

const goToChat = () => {
  if (!userStore.canAccessChat) {
    return navigateTo("/user/referral");
  }
  return navigateTo("/chat");
};

const deleteAccount = async () => {
  console.warn("Deleting account");
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/account/delete-account`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(SnackbarMessages.Error);
    return;
  }

  sechatStore.showSuccessSnackbar(SnackbarMessages.Success);
  userStore.$reset();
  return navigateTo("/user/register");
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

    await refreshHandler.signOutCleanup();
  } catch (error) {
    appStore.showErrorSnackbar(error);
  }
};
</script>
