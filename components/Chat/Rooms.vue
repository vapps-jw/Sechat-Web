<template>
  <v-container>
    <v-card class="mx-auto" max-width="800">
      <v-toolbar>
        <v-btn icon="mdi-menu"></v-btn>

        <v-toolbar-title>Tu zrobic guzik na dodawanie roomow</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon="mdi-magnify"></v-btn>
      </v-toolbar>
      <v-list lines="two">
        <v-list-item
          class="my-1"
          v-for="room in chatStore.rooms.value"
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
  </v-container>
</template>

<script setup lang="ts">
const chatStore = useChatStore();
const appStore = useAppStore();
</script>

<style scoped></style>
