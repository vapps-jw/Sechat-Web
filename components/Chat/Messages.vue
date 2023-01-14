<template>
  <div>
    <v-container class="fill-height" max-heigth="100">
      <v-row class="fill-height pb-14">
        <v-col>
          <div
            v-for="(item, index) in chat"
            :key="index"
            :class="[
              'd-flex flex-row align-center my-2',
              item.from == 'user' ? 'justify-end' : null,
            ]"
          >
            <span v-if="item.from == 'user'" class="blue--text mr-3">{{
              item.msg
            }}</span>
            <v-avatar :color="item.from == 'user' ? 'indigo' : 'red'" size="36">
              <span class="white--text">{{ item.from[0] }}</span>
            </v-avatar>
            <span v-if="item.from != 'user'" class="blue--text ml-3">{{
              item.msg
            }}</span>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-footer sticky>
      <v-container class="ma-0 pa-0">
        <v-row no-gutters>
          <v-col>
            <div class="d-flex flex-row align-center">
              <v-text-field
                v-model="msg"
                placeholder="Type Something"
                @keypress.enter="send"
              ></v-text-field>
              <v-btn icon class="ml-4" @click="send"
                ><v-icon>mdi-send</v-icon></v-btn
              >
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>

<script setup lang="ts">
const chatStore = useChatStore();

const chat = ref([]);
const msg = ref("");

const send = () => {
  chat.value.push({
    from: "user",
    msg: msg,
  });
  msg.value = null;
  addReply();
};
const addReply = () => {
  chat.value.push({
    from: "sushant",
    msg: "Hmm",
  });
};
</script>

<style scoped></style>
