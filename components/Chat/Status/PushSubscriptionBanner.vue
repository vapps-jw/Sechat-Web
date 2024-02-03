<template>
  <v-banner lines="one" color="warning">
    <template v-slot:prepend>
      <div class="d-flex align-center">
        <Icon name="svg-spinners:pulse-rings-multiple" />
      </div>
    </template>
    <template v-slot:text>
      <div class="font-weight-bold text-warning">Push Notifications</div>
    </template>
    <template v-slot:actions>
      <ChatProfileAllowNotifications />
    </template>
  </v-banner>
</template>
