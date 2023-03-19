<template>
  <div>
    <v-container>
      <client-only>
        <div
          class="d-flex flex-column align-center"
          v-if="userData.isSignedIn.value"
        >
          <v-btn class="my-2" size="large">
            <NuxtLink class="sechat-link-clear" :to="`/chat`">Chat</NuxtLink>
          </v-btn>
          <v-btn class="my-2" size="large" @click="signOut">Sign Out</v-btn>
        </div>
        <div class="d-flex flex-column align-center" v-else>
          <v-btn class="my-2" size="large">
            <NuxtLink class="sechat-link-clear" :to="`/user/login`"
              >Sign In</NuxtLink
            >
          </v-btn>
          <v-btn class="my-2" size="large">
            <NuxtLink class="sechat-link-clear" :to="`/user/register`"
              >Sign Up</NuxtLink
            >
          </v-btn>
        </div>
      </client-only>
    </v-container>
  </div>
</template>

<script setup lang="ts">
const userData = useUserData();
const chatStore = useChatStore();

const signOut = () => {
  userData.signOut();
  chatStore.clearState();
};
</script>

<style scoped></style>
