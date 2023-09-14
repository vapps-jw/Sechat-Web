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
        <v-toolbar-title>{{ userStore.getUserName }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click="backToHomePage"
          icon="mdi-location-exit"
          variant="outlined"
        ></v-btn>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-list flex align-center>
          <!-- TODO: enable theme switch, fix light colors -->
          <!-- <v-list-item>
            <ChatProfileThemeSection />
          </v-list-item> -->
          <v-list-item>
            <ChatProfilePictureSection />
          </v-list-item>
          <v-divider />
          <v-list-item>
            <ChatProfileInvitationsPermissionSection />
          </v-list-item>
          <v-divider />
          <v-list-item>
            <ChatProfileTooltipsSection />
          </v-list-item>
          <v-divider />
          <v-list-item>
            <ChatProfileEmailSection />
          </v-list-item>
          <v-divider />
          <v-list-item>
            <ChatProfileNotificationsSection />
          </v-list-item>
          <v-divider />
          <v-list-item>
            <ChatProfileDangerZoneSection />
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const backToHomePage = () => {
  navigateTo("/");
};
</script>

<style scoped></style>
