<template>
  <v-container class="d-flex flex-column align-center">
    <v-btn
      class="my-2"
      size="large"
      href="https://app.termly.io/document/privacy-policy/973a81f1-58b8-4316-8e74-c1b7d6059b50"
    >
      Privacy Policy
    </v-btn>
    <v-btn
      class="my-2"
      size="large"
      href="https://app.termly.io/document/cookie-policy/889cd4e1-89ca-4200-b30d-dc281efce745"
    >
      Cookie Policy
    </v-btn>
    <v-btn class="my-2" size="large">
      <NuxtLink class="sechat-link-clear" :to="`/policies/tos`"
        >Terms of Service</NuxtLink
      >
    </v-btn>
  </v-container>
</template>

<style scoped></style>
