<template>
  <v-sheet id="chatView" class="ma-0 pr-1 overflow-auto">
    <v-infinite-scroll mode="manual" side="start" @load="loadMore">
      <template v-for="(m, index) in props.messages" :key="m.id">
        <v-row
          v-if="
            index === 0 ||
            new Date(props.messages[index - 1].created).setHours(0, 0, 0, 0) !==
              new Date(m.created).setHours(0, 0, 0, 0)
          "
          no-gutters
          class="flex-nowrap align-center my-3"
        >
          <v-col cols="2" class="flex-grow-0 flex-shrink-1 ml-2">
            <v-divider color="tertiary"></v-divider>
          </v-col>

          <v-col
            style="min-width: 150px"
            cols="8"
            class="d-flex flex-grow-1 flex-shrink-0 justify-center align-center"
          >
            <v-sheet class="mx-3">
              <div class="small-font text-primary">
                {{
                  new Date(m.created).toLocaleString(appStore.localLanguage, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="2" class="flex-grow-0 flex-shrink-1">
            <v-divider color="tertiary"></v-divider>
          </v-col>
        </v-row>
        <chat-messages-message
          :show-header="true"
          :message="m"
          v-if="chatStore.activeRoomId"
          :image="
            m.nameSentBy === userStore.getUserName
              ? userStore.getProfilePicture
              : chatStore.profilePictures.get(m.nameSentBy)
          "
        />
        <chat-messages-direct-message
          :message-index="index"
          :last-message-index="props.messages.length - 1"
          :show-header="
            index === 0
              ? true
              : props.messages[index - 1].nameSentBy !== m.nameSentBy
              ? true
              : new Date(props.messages[index - 1].created).setSeconds(
                  new Date(props.messages[index - 1].created).getSeconds() + 30
                ) > new Date(m.created).getTime()
              ? false
              : true
          "
          :message="m"
          :image="
            m.nameSentBy === userStore.getUserName
              ? userStore.getProfilePicture
              : chatStore.profilePictures.get(m.nameSentBy)
          "
          v-if="chatStore.activeContactId"
        />
      </template>
      <template v-slot:empty> No more messages</template>
      <template v-slot:error> Error </template>
      <template v-slot:load-more="{ props }">
        <v-btn
          v-if="chatStore.canLoadMore"
          variant="outlined"
          size="small"
          v-bind="props"
          >Load More Messages</v-btn
        >
      </template>
    </v-infinite-scroll>
  </v-sheet>
  <v-container class="pa-0">
    <v-card min-height="30" :elevation="0">
      <chat-messages-typing-users
        class="on-top"
        v-if="chatStore.typingUsers.length > 0"
      />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { LocalStoreTypes } from "~/utilities/globalEnums";

const appStore = useSechatAppStore();
const userStore = useUserStore();
const chatStore = useSechatChatStore();
const config = useRuntimeConfig();
const e2e = useE2Encryption();
const fetchingMessages = ref<boolean>(false);

interface PropsModel {
  messages: IMessageBase[];
}
const props = defineProps<PropsModel>();

const loadMore = async ({ side, done }) => {
  if (fetchingMessages.value) {
    return;
  }
  fetchingMessages.value = true;
  console.warn("Load more triggered");
  try {
    if (chatStore.activeContactId) {
      if (chatStore.getActiveContact.directMessages.length < 10) {
        return;
      }
      done(await loadMoreForContact());
    }
    if (chatStore.activeRoomId) {
      if (chatStore.getActiveRoom.messages.length < 10) {
        return;
      }

      done(await loadMoreForRoom());
    }
  } catch (error) {
    console.error(error);
    done("error");
  } finally {
    fetchingMessages.value = false;
  }
};

const loadMoreForRoom = async (): Promise<string> => {
  console.log("Messages", chatStore.getActiveRoom.messages);
  console.log("First message", chatStore.getActiveRoom.messages[0].id);
  const { error: apiError, data: uc } = await useFetch<IMessage[]>(
    `${config.public.apiBase}/chat/room/${chatStore.activeRoomId}/load-more/${chatStore.getActiveRoom.messages[0].id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (apiError.value) {
    throw createError({
      ...apiError.value,
      statusCode: apiError.value.statusCode,
      statusMessage: apiError.value.data,
    });
  }

  console.log("New Messages fetched", uc.value);
  if (uc.value.length === 0) {
    return "empty";
  }

  const key = e2e.getKey(chatStore.activeRoomId, LocalStoreTypes.E2EROOMS);
  if (!key) {
    return "error";
  }
  uc.value.forEach((m) => {
    m.text = e2e.decryptMessage(m.text, key);
    m.loaded = true;
  });

  chatStore.addMoreMessagesToRoom(chatStore.activeRoomId, uc.value);
  return "ok";
};

const loadMoreForContact = async (): Promise<string> => {
  console.log("Messages", chatStore.getActiveContact.directMessages);
  console.log("First message", chatStore.getActiveContact.directMessages[0].id);
  const { error: apiError, data: uc } = await useFetch<IDirectMessage[]>(
    `${config.public.apiBase}/chat/contact/${chatStore.activeContactId}/load-more/${chatStore.getActiveContact.directMessages[0].id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (apiError.value) {
    throw createError({
      ...apiError.value,
      statusCode: apiError.value.statusCode,
      statusMessage: apiError.value.data,
    });
  }

  console.log("New Messages fetched", uc.value);
  if (uc.value.length === 0) {
    return "empty";
  }

  const key = e2e.getKey(chatStore.activeContactId, LocalStoreTypes.E2EDM);
  if (!key) {
    return "error";
  }
  uc.value.forEach((m) => {
    m.text = e2e.decryptMessage(m.text, key);
    m.loaded = true;
  });

  chatStore.addMoreMessagesToContact(chatStore.activeContactId, uc.value);
  return "ok";
};

const scrollToBottom = () => {
  const chatSection = document.getElementById("chatView");
  if (chatSection) {
    setTimeout(() => {
      chatSection.scrollTop = chatSection.scrollHeight;
    }, 0);
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.container-style {
  height: 42dvh;
}
</style>
