<template>
  <v-app id="main-view">
    <v-main>
      <v-container class="bg-transparent">
        <div class="d-flex justify-center">
          <NuxtImg src="/logos/sechat-black-tr-300x300.png" alt=""></NuxtImg>
        </div>
        <div class="d-flex justify-center flex-wrap">
          <v-chip class="ma-2" color="warning"> BETA v0.3.2 </v-chip>
          <v-chip class="ma-2" color="warning">
            For best experience use as PWA
          </v-chip>
          <v-chip v-if="!notificationsAllowed" class="ma-2" color="error">
            Notifications Not Allowed
          </v-chip>
        </div>
        <v-divider class="my-4"></v-divider>
      </v-container>
      <GdprDialog />
      <chat-snackbar />
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const sechatNotifications = useSechatNotifications();
const notificationsAllowed = useState<boolean>(
  "notificationsAllowed",
  () => Notification.permission === "granted"
);

onMounted(() => {
  console.warn(
    "--> Chekcing notification permission",
    notificationsAllowed.value
  );
  if (!notificationsAllowed.value) {
    console.warn("--> Requesting notification permission");
    Notification.requestPermission().then((result) => {
      if (result === "granted") {
        console.warn("--> Permission Granted");
        notificationsAllowed.value = Notification.permission === "granted";
      }
    });
  }
});
</script>

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
