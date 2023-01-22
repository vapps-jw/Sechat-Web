<template>
  <v-container>
    <v-card class="mx-auto sechat-v-card-full" max-width="800">
      <v-toolbar>
        <v-toolbar-title>{{
          userData.userProfile.value.userName
        }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click="backToHomePage"
          size="small"
          icon="mdi-location-exit"
          color="warning"
          variant="outlined"
        ></v-btn>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 sechat-v-card-text-full">
        <v-list>
          <v-list-subheader>My Connections</v-list-subheader>
          <v-list-item title="Friends">
            <template v-slot:append>
              <ChatProfileFriendsTab />
            </template>
          </v-list-item>
          <v-list-item title="Blocked Users">
            <template v-slot:append> </template>
          </v-list-item>
          <v-list-subheader color="error">Danger Zone</v-list-subheader>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const userData = useUserData();

const backToHomePage = () => {
  navigateTo("/");
};
</script>

<style scoped></style>
