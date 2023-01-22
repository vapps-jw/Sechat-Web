<template>
  <div>
    <v-container>
      <v-sheet class="mx-2 bg-transparent">
        <NuxtImg
          src="/logos/sechat-black-tr-300x300.png"
          alt=""
          class="w-[300px] h-full"
        ></NuxtImg>
        <NuxtErrorBoundary>
          <v-btn @click="throwClientSideError">Error</v-btn>
          <template #error="{ error }">
            <div>
              <h1>Sorry Error</h1>
              <code>{{ error }}</code>
              <v-btn @click="handleClientError(error)">Go Back</v-btn>
            </div>
          </template>
        </NuxtErrorBoundary>
        <v-divider class="my-4"></v-divider>
        <client-only>
          <div v-if="userData.isSignedIn.value">
            <v-btn>
              <NuxtLink class="sechat-link-clear" :to="`/chat`">Chat</NuxtLink>
            </v-btn>
            <v-btn @click="userData.signOut">Sign Out</v-btn>
          </div>
          <div v-else>
            <v-btn>
              <NuxtLink class="sechat-link-clear" :to="`/user/login`"
                >Sign In</NuxtLink
              >
            </v-btn>
            <v-btn>
              <NuxtLink class="sechat-link-clear" :to="`/user/register`"
                >Sign Up</NuxtLink
              >
            </v-btn>
          </div>
        </client-only>
      </v-sheet>
    </v-container>
  </div>
</template>

<script setup lang="ts">
const userData = useUserData();

const throwClientSideError = () => {
  throw createError({
    statusCode: 400,
    message: "upsie wopsie",
  });
};

const handleClientError = (error: any) => {
  error.value = null;
};
</script>

<style scoped></style>
