<template>
  <v-container class="d-flex justify-center align-center">
    <v-card min-width="350" width="700" class="sechat-v-card-full">
      <v-toolbar>
        <div class="ml-2">
          <ChatUserAvatar
            :picture="userStore.userProfile.profilePicture"
            :active="false"
            :user-name="userStore.getUserName"
            size="default"
          />
        </div>
        <v-toolbar-title>Admin</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-list flex align-center>
          <v-list-item>
            <ChatGlobalSettingsRegistration />
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const userStore = useUserStore();
</script>

<style scoped></style>
