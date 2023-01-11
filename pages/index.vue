<template>
  <div>
    <v-container>
      <v-sheet class="mx-2 bg-transparent">
        <NuxtImg
          src="/logos/sechat-black-b-300x300.png"
          alt=""
          class="w-[300px] h-full"
        ></NuxtImg>
        <v-divider class="my-4"></v-divider>
        <NuxtLink class="text-blue-400 mr-5" :to="`/user/login`"
          >Sign In</NuxtLink
        >
        <NuxtLink class="text-blue-400 mr-5" :to="`/user/register`"
          >Sign Up</NuxtLink
        >
      </v-sheet>
    </v-container>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
