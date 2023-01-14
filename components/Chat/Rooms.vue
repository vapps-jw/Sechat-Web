<template>
  <div>
    <v-card class="mx-auto" max-width="600">
      <v-list lines="two">
        <v-list-item
          v-for="room in chatStore.rooms.value"
          :key="room.id"
          :title="room.name"
          :subtitle="new Date(room.lastActivity).toLocaleString()"
        >
          <template v-slot:prepend>
            <v-avatar color="amber">
              <v-icon color="white">"mdi-clipboard-text"</v-icon>
            </v-avatar>
          </template>

          <template v-slot:append>
            <v-btn
              color="grey-lighten-1"
              icon="mdi-information"
              variant="text"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const chatStore = useChatStore();

const files = [
  {
    color: "blue",
    icon: "mdi-clipboard-text",
    subtitle: "Jan 20, 2014",
    title: "Vacation itinerary",
  },
  {
    color: "amber",
    icon: "mdi-gesture-tap-button",
    subtitle: "Jan 10, 2014",
    title: "Kitchen remodel",
  },
];
</script>

<style scoped></style>
