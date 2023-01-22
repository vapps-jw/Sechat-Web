<template>
  <v-container>
    <v-card class="mx-auto sechat-v-card-full" max-width="800">
      <v-toolbar>
        <v-toolbar-title>Rooms</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-dialogs-add-room />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 sechat-v-card-text-full">
        <v-list lines="two">
          <v-list-item
            class="my-1"
            v-for="room in chatStore.getRooms.value"
            @click="chatStore.selectRoom(room)"
            :key="room.id"
            :title="room.name"
            active-color="primary"
            :value="room"
            :subtitle="
              new Date(room.lastActivity).toLocaleString(
                appStore.localLanguage.value
              )
            "
          >
            <template v-slot:prepend>
              <v-btn
                size="small"
                icon="mdi-account-plus"
                color="success"
                variant="outlined"
                class="mr-2"
              ></v-btn>
            </template>

            <template v-slot:append>
              <chat-dialogs-delete-room
                v-if="room.creatorId === userData.userProfile.value.userId"
                :room="room"
              />

              <v-btn
                size="small"
                icon="mdi-exit-to-app"
                color="warning"
                variant="outlined"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useChatStore();
const appStore = useAppStore();
const userData = useUserData();
</script>

<style scoped></style>
