<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn color="primary" dark v-bind="props"> More Contacts? </v-btn>
    </template>

    <v-card>
      <v-toolbar>
        <v-btn icon dark @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Contact suggestions</v-toolbar-title>
      </v-toolbar>
      <v-infinite-scroll :onLoad="loadMore" :canLoadMore="newSuggestions">
        <template
          v-for="(us, index) in chatStore.suggestedContacts"
          :key="us.userName"
        >
          <v-list-item :border="true" class="my-2 mx-1 pa-1">
            <template v-slot:title>
              <div>
                {{ us.userName }}
              </div>
            </template>
            <template v-slot:prepend>
              <div class="d-flex align-center justify-center mr-2 flex-column">
                <ChatUserAvatar
                  :active="false"
                  :user-name="us.userName"
                  :picture="us.profilePicture"
                  size="large"
                />
              </div>
            </template>
            <template v-slot:append>
              <v-btn
                class="mr-3"
                @click="invite(us.userName)"
                size="small"
                icon="mdi-plus"
                color="success"
                variant="outlined"
              ></v-btn>
            </template>
          </v-list-item>
        </template>
        <template v-slot:empty>
          <ChatSechatSeparator message="Thats all" />
        </template>
        <template v-slot:error> Error </template>
      </v-infinite-scroll>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
const config = useRuntimeConfig();

const emit = defineEmits(["inviteUser"]);
const newSuggestions = ref<boolean>(true);
const dialog = ref<boolean>(false);

const invite = (userName: string) => {
  emit("inviteUser", userName);
};

const loadMore = async ({ side, done }) => {
  console.log("Loading more suggestions");

  const { error: apiError, data: suggestions } = await useFetch<
    SuggestedContact[]
  >(`${config.public.apiBase}/user/suggest-contacts`, {
    method: "POST",
    credentials: "include",
    body: {
      data: chatStore.suggestedContacts.map((i) => i.userName),
    },
  });

  if (apiError.value) {
    done("ok");
    return;
  }

  if (suggestions.value.length == 0) {
    done("empty");
    newSuggestions.value = false;
    return;
  }

  console.log("Suggestions Fetched", suggestions.value);
  suggestions.value.forEach((sc) => {
    chatStore.suggestedContacts.push(sc);
  });
  done("ok");
};
</script>

<style scoped>
.suggestions-list {
  max-height: 30dvw;
}
</style>
