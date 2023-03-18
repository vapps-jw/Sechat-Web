<template>
  <v-container>
    <v-card class="mx-auto sechat-v-card-full" max-width="800">
      <v-toolbar>
        <v-toolbar-title>Rooms</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-rooms-create-room />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 sechat-v-card-text-full">
        <v-list>
          <v-list-item
            v-for="room in chatStore.availableRooms.value"
            :key="room.id"
            :title="room.name"
          >
            <template v-slot:append>
              <chat-rooms-delete-room
                v-if="room.creatorName === userData.userProfile.value.userName"
                :room="room"
                class="mr-2"
              />
              <v-btn
                v-if="room.creatorName !== userData.userProfile.value.userName"
                size="small"
                icon="mdi-exit-to-app"
                color="warning"
                variant="outlined"
                class="mr-2"
              ></v-btn>
              <v-btn
                @click="chatStore.selectRoom(room)"
                size="small"
                icon="mdi-arrow-right"
                color="success"
                variant="outlined"
                class="mr-2"
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
const userData = useUserData();
</script>

<style scoped></style>
