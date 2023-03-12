<template>
  <v-app id="chat-view">
    <v-main>
      <client-only>
        <chat-snackbar />
      </client-only>
      <slot />
    </v-main>
  </v-app>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
